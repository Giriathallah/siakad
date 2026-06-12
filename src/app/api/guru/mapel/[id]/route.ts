import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, err, notFound } from "@/lib/api-response"
import { updateMapelSchema } from "@/lib/validations"

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const body = await validateBody(request, updateMapelSchema)
    if (!body.ok) return body.response

    const existing = await prisma.mataPelajaran.findUnique({ where: { id } })
    if (!existing) return notFound("Mata pelajaran tidak ditemukan")

    // Cek duplikasi kode jika diubah
    if (body.data.kodeMapel && body.data.kodeMapel !== existing.kodeMapel) {
        const dup = await prisma.mataPelajaran.findUnique({
            where: { kodeMapel: body.data.kodeMapel },
        })
        if (dup) return err("Kode mapel sudah digunakan", 409)
    }

    const data = await prisma.mataPelajaran.update({
        where: { id },
        data: {
            ...(body.data.kodeMapel && { kodeMapel: body.data.kodeMapel }),
            ...(body.data.namaMapel && { namaMapel: body.data.namaMapel }),
            ...(body.data.kkm !== undefined && { kkm: body.data.kkm }),
        },
    })

    return ok(data, 200, "Mata pelajaran berhasil diperbarui")
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const existing = await prisma.mataPelajaran.findUnique({ where: { id } })
    if (!existing) return notFound("Mata pelajaran tidak ditemukan")

    await prisma.mataPelajaran.delete({ where: { id } })
    return ok(null, 200, "Mata pelajaran berhasil dihapus")
}