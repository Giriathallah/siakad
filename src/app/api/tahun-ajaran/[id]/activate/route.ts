import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, ok, notFound } from "@/lib/api-response"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const existing = await prisma.tahunAjaran.findUnique({ where: { id } })
    if (!existing) return notFound("Tahun ajaran tidak ditemukan")

    await prisma.$transaction([
        prisma.tahunAjaran.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        }),
        prisma.tahunAjaran.update({
            where: { id },
            data: { isActive: true },
        }),
    ])

    return ok(null, 200, "Tahun ajaran berhasil diaktifkan")
}