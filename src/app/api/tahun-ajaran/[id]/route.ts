import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, notFound } from "@/lib/api-response"
import { updateTahunAjaranSchema } from "@/lib/validations"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const body = await validateBody(request, updateTahunAjaranSchema)
    if (!body.ok) return body.response

    const existing = await prisma.tahunAjaran.findUnique({ where: { id } })
    if (!existing) return notFound("Tahun ajaran tidak ditemukan")

    const data = await prisma.tahunAjaran.update({
        where: { id },
        data: {
            ...(body.data.namaPeriode && { namaPeriode: body.data.namaPeriode }),
        },
    })

    return ok(data, 200, "Tahun ajaran berhasil diperbarui")
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const existing = await prisma.tahunAjaran.findUnique({ where: { id } })
    if (!existing) return notFound("Tahun ajaran tidak ditemukan")

    await prisma.tahunAjaran.delete({ where: { id } })
    return ok(null, 200, "Tahun ajaran berhasil dihapus")
}