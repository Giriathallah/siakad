import prisma from "@/lib/prisma"
import { requireRole, ok } from "@/lib/api-response"

export async function GET() {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const [totalSiswa, totalGuru, totalKelas, tahunAjaranAktif, siswaTerbaru] =
        await Promise.all([
            prisma.siswa.count({ where: { deletedAt: null } }),
            prisma.guru.count({ where: { deletedAt: null } }),
            prisma.kelas.count(),
            prisma.tahunAjaran.findFirst({ where: { isActive: true } }),
            prisma.siswa.findMany({
                where: { deletedAt: null },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { kelas: { select: { namaKelas: true, tingkat: true } } },
            }),
        ])

    return ok({
        totalSiswa,
        totalGuru,
        totalKelas,
        tahunAjaranAktif,
        siswaTerbaru,
    })
}