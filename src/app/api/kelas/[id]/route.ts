import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, notFound } from "@/lib/api-response"
import { updateKelasSchema } from "@/lib/validations"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const body = await validateBody(request, updateKelasSchema)
    if (!body.ok) return body.response

    const existing = await prisma.kelas.findUnique({ where: { id } })
    if (!existing) return notFound("Kelas tidak ditemukan")

    const data = await prisma.kelas.update({
        where: { id },
        data: {
            ...(body.data.tingkat && { tingkat: body.data.tingkat }),
            ...(body.data.namaKelas && { namaKelas: body.data.namaKelas }),
            ...(body.data.waliKelasId !== undefined && { waliKelasId: body.data.waliKelasId }),
        },
        include: {
            waliKelas: { select: { id: true, namaLengkap: true } },
        },
    })

    return ok(data, 200, "Kelas berhasil diperbarui")
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const existing = await prisma.kelas.findUnique({ where: { id } })
    if (!existing) return notFound("Kelas tidak ditemukan")

    await prisma.kelas.delete({ where: { id } })
    return ok(null, 200, "Kelas berhasil dihapus")
}