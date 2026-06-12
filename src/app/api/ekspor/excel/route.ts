// Ekspor Excel route
import { NextRequest } from "next/server"
import * as XLSX from "xlsx"
import prisma from "@/lib/prisma"
import { requireRole, getSearchParams } from "@/lib/api-response"
import { nilaiQuerySchema } from "@/lib/validations"
import { Prisma } from "@/generated/prisma/client"

export async function GET(request: NextRequest) {
    const auth = await requireRole("ADMIN", "GURU")
    if (!auth.ok) return auth.response

    const params = getSearchParams(request)
    const parsed = nilaiQuerySchema.safeParse(
        Object.fromEntries(params.entries())
    )
    if (!parsed.success) {
        return new Response("Parameter tidak valid", { status: 422 })
    }

    const { mapelId, kelasId, tahunAjaranId } = parsed.data

    const where: Prisma.NilaiWhereInput = {
        ...(mapelId && { mapelId }),
        ...(tahunAjaranId && { tahunAjaranId }),
        ...(kelasId && { siswa: { kelasId } }),
    }

    const nilaiList = await prisma.nilai.findMany({
        where,
        include: {
            siswa: {
                select: {
                    nis: true,
                    namaLengkap: true,
                    kelas: { select: { namaKelas: true } },
                },
            },
            mataPelajaran: { select: { namaMapel: true } },
        },
        orderBy: { siswa: { namaLengkap: "asc" } },
    })

    const rows = nilaiList.map((n) => ({
        NIS: n.siswa.nis,
        "Nama Siswa": n.siswa.namaLengkap,
        Kelas: n.siswa.kelas?.namaKelas || "-",
        "Mata Pelajaran": n.mataPelajaran.namaMapel,
        Tugas: Number(n.nilaiTugas),
        UTS: Number(n.nilaiUts),
        UAS: Number(n.nilaiUas),
        "Nilai Akhir": Number(n.nilaiAkhir),
        Status: n.statusLulus ? "LULUS" : "TIDAK LULUS",
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Nilai")
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })

    return new Response(buffer, {
        headers: {
            "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="rekap-nilai.xlsx"`,
        },
    })
}