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
    if (!siswa) return ok([])

    const nilaiList = await prisma.nilai.findMany({
        where: {
            siswaId: siswa.id,
            ...(tahunAjaranId && { tahunAjaranId }),
        },
        include: {
            mataPelajaran: true,
            tahunAjaran: true,
        },
        orderBy: { mataPelajaran: { namaMapel: "asc" } },
    })

    return ok(nilaiList)
}