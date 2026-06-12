import prisma from "@/lib/prisma"
import { requireRole, ok } from "@/lib/api-response"

export async function GET() {
    const auth = await requireRole("SISWA")
    if (!auth.ok) return auth.response

    const siswa = await prisma.siswa.findUnique({
        where: { userId: auth.session.user.id },
        include: { kelas: true },
    })

    if (!siswa) return ok(null)
    return ok(siswa)
}