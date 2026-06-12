import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, ok, getParam } from "@/lib/api-response"

export async function GET(request: NextRequest) {
    const auth = await requireRole("SISWA")
    if (!auth.ok) return auth.response

    const tahunAjaranId = getParam(request, "tahunAjaranId")

    const siswa = await prisma.siswa.findUnique({
        where: { userId: auth.session.user.id },
    })
    if (!siswa) return ok(null)

    const nilaiList = await prisma.nilai.findMany({
        where: {
            siswaId: siswa.id,
            ...(tahunAjaranId && { tahunAjaranId }),
        },
    })

    const totalMapel = nilaiList.length
    const rataRata =
        totalMapel > 0
            ? Math.round(
                (nilaiList.reduce((sum, n) => sum + (Number(n.nilaiAkhir) || 0), 0) /
                    totalMapel) *
                100
            ) / 100
            : 0
    const lulusSemua = totalMapel > 0 && nilaiList.every((n) => n.statusLulus)

    return ok({
        rataRata,
        totalMapel,
        lulusSemua,
        jumlahLulus: nilaiList.filter((n) => n.statusLulus).length,
        jumlahTidakLulus: nilaiList.filter((n) => !n.statusLulus).length,
    })
}