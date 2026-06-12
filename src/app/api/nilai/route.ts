// GET (filter), POST (upsert batch) nilai
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, err, getSearchParams } from "@/lib/api-response"
import { saveNilaiBatchSchema, nilaiQuerySchema } from "@/lib/validations"
import { Prisma } from "@/generated/prisma/client"


// ─────────────────────────────────────────
// Helper: Kalkulasi nilai
// ─────────────────────────────────────────
function hitungNilaiAkhir(tugas: number, uts: number, uas: number): number {
    return Math.round((0.3 * tugas + 0.3 * uts + 0.4 * uas) * 100) / 100
}

// ─────────────────────────────────────────
// GET /api/nilai — Filter nilai
// ─────────────────────────────────────────
export async function GET(request: NextRequest) {
    const auth = await requireRole("ADMIN", "GURU", "SISWA")
    if (!auth.ok) return auth.response

    const params = getSearchParams(request)
    const parsed = nilaiQuerySchema.safeParse(
        Object.fromEntries(params.entries())
    )
    if (!parsed.success) {
        return err(parsed.error.issues[0]?.message || "Parameter tidak valid", 422)
    }

    const { mapelId, kelasId, tahunAjaranId, siswaId } = parsed.data

    const where: Prisma.NilaiWhereInput = {
        ...(mapelId && { mapelId }),
        ...(tahunAjaranId && { tahunAjaranId }),
        ...(siswaId && { siswaId }),
        ...(kelasId && { siswa: { kelasId } }),
    }

    const nilaiList = await prisma.nilai.findMany({
        where,
        include: {
            siswa: {
                select: {
                    id: true,
                    nis: true,
                    namaLengkap: true,
                    kelas: { select: { id: true, namaKelas: true, tingkat: true } },
                },
            },
            mataPelajaran: true,
            guru: { select: { id: true, namaLengkap: true } },
            tahunAjaran: true,
        },
        orderBy: { siswa: { namaLengkap: "asc" } },
    })

    return ok(nilaiList)
}

// ─────────────────────────────────────────
// POST /api/nilai — Batch upsert nilai
// ─────────────────────────────────────────
export async function POST(request: NextRequest) {
    const auth = await requireRole("GURU", "ADMIN")
    if (!auth.ok) return auth.response

    const body = await validateBody(request, saveNilaiBatchSchema)
    if (!body.ok) return body.response

    const items = body.data

    // Ambil KKM per mapel (unique mapelIds)
    const mapelIds = [...new Set(items.map((item) => item.mapelId))]
    const mapelList = await prisma.mataPelajaran.findMany({
        where: { id: { in: mapelIds } },
    })
    const kkmMap = new Map(mapelList.map((m) => [m.id, Number(m.kkm)]))

    // Validasi semua mapel ditemukan
    if (mapelList.length !== mapelIds.length) {
        return err("Ada mata pelajaran yang tidak ditemukan", 404)
    }

    // Upsert semua nilai dalam transaction
    const results = await prisma.$transaction(
        items.map((item) => {
            const nilaiAkhir = hitungNilaiAkhir(
                item.nilaiTugas,
                item.nilaiUts,
                item.nilaiUas
            )
            const kkm = kkmMap.get(item.mapelId) ?? 70
            const statusLulus = nilaiAkhir >= kkm

            return prisma.nilai.upsert({
                where: {
                    siswaId_mapelId_tahunAjaranId: {
                        siswaId: item.siswaId,
                        mapelId: item.mapelId,
                        tahunAjaranId: item.tahunAjaranId,
                    },
                },
                create: {
                    siswaId: item.siswaId,
                    mapelId: item.mapelId,
                    guruId: item.guruId,
                    tahunAjaranId: item.tahunAjaranId,
                    nilaiTugas: item.nilaiTugas,
                    nilaiUts: item.nilaiUts,
                    nilaiUas: item.nilaiUas,
                    nilaiAkhir,
                    statusLulus,
                },
                update: {
                    nilaiTugas: item.nilaiTugas,
                    nilaiUts: item.nilaiUts,
                    nilaiUas: item.nilaiUas,
                    nilaiAkhir,
                    statusLulus,
                    guruId: item.guruId,
                },
            })
        })
    )

    return ok(results, 200, `${results.length} nilai berhasil disimpan`)
}