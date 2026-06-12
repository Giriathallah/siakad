// Assign mata pelajaran to guru
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, notFound } from "@/lib/api-response"
import { assignMapelSchema } from "@/lib/validations"

type RouteContext = { params: Promise<{ id: string }> }

// PUT /api/guru/:id/mapel — Replace mata pelajaran yang diajar
export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const body = await validateBody(request, assignMapelSchema)
    if (!body.ok) return body.response

    const guru = await prisma.guru.findUnique({ where: { id } })
    if (!guru) return notFound("Guru tidak ditemukan")

    // Validasi: pastikan semua mapelId ada di database
    const mapelCount = await prisma.mataPelajaran.count({
        where: { id: { in: body.data.mapelIds } },
    })
    if (mapelCount !== body.data.mapelIds.length) {
        return notFound("Ada mata pelajaran yang tidak ditemukan")
    }

    await prisma.$transaction([
        prisma.guruMapel.deleteMany({ where: { guruId: id } }),
        prisma.guruMapel.createMany({
            data: body.data.mapelIds.map((mapelId) => ({ guruId: id, mapelId })),
        }),
    ])

    const updated = await prisma.guru.findUnique({
        where: { id },
        include: { guruMapel: { include: { mataPelajaran: true } } },
    })

    return ok(updated, 200, "Mata pelajaran berhasil diperbarui")
}