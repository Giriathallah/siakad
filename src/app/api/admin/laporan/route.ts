import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, ok, err, getSearchParams } from "@/lib/api-response"
import { laporanQuerySchema } from "@/lib/validations"
import { Prisma } from "@/generated/prisma/client"

export async function GET(request: NextRequest) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const params = getSearchParams(request)
    const parsed = laporanQuerySchema.safeParse(
        Object.fromEntries(params.entries())
    )
    if (!parsed.success) {
        return err(parsed.error.issues[0]?.message || "Parameter tidak valid", 422)
    }

    const { tahunAjaranId, kelasId, mapelId } = parsed.data

    const where: Prisma.NilaiWhereInput = {
        ...(tahunAjaranId && { tahunAjaranId }),
        ...(mapelId && { mapelId }),
        ...(kelasId && { siswa: { kelasId } }),
    }

    const nilaiList = await prisma.nilai.findMany({
        where,
        include: {
            siswa: {
                select: {
                    nis: true,
                    namaLengkap: true,
                    kelas: { select: { tingkat: true, namaKelas: true } },
                },
            },
            mataPelajaran: { select: { namaMapel: true, kkm: true } },
            tahunAjaran: { select: { namaPeriode: true } },
            guru: { select: { namaLengkap: true } },
        },
        orderBy: [
            { siswa: { kelas: { tingkat: "asc" } } },
            { siswa: { namaLengkap: "asc" } },
        ],
    })

    // Summary
    const totalLulus = nilaiList.filter((n) => n.statusLulus).length
    const totalTidakLulus = nilaiList.filter((n) => !n.statusLulus).length
    const rataRata =
        nilaiList.length > 0
            ? Math.round(
                (nilaiList.reduce((sum, n) => sum + (Number(n.nilaiAkhir) || 0), 0) /
                    nilaiList.length) *
                100
            ) / 100
            : 0

    return ok({
        nilai: nilaiList,
        summary: {
            total: nilaiList.length,
            totalLulus,
            totalTidakLulus,
            rataRata,
        },
    })
}