// Guru detail, update, delete by id
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, err, notFound } from "@/lib/api-response"
import { updateGuruSchema } from "@/lib/validations"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const guru = await prisma.guru.findUnique({
        where: { id },
        include: {
            user: { select: { email: true, isActive: true } },
            guruMapel: { include: { mataPelajaran: true } },
            waliKelas: { select: { id: true, tingkat: true, namaKelas: true } },
        },
    })

    if (!guru || guru.deletedAt) return notFound("Guru tidak ditemukan")
    return ok(guru)
}

export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const body = await validateBody(request, updateGuruSchema)
    if (!body.ok) return body.response

    const guru = await prisma.guru.findUnique({ where: { id } })
    if (!guru) return notFound("Guru tidak ditemukan")

    // Cek duplikasi NIP jika diubah
    if (body.data.nip && body.data.nip !== guru.nip) {
        const dup = await prisma.guru.findUnique({ where: { nip: body.data.nip } })
        if (dup) return err("NIP sudah digunakan", 409)
    }

    const { nip, namaLengkap, isActive, mapelIds, kelasId } = body.data

    const updated = await prisma.$transaction(async (tx) => {
        // Update guru info
        await tx.guru.update({
            where: { id },
            data: {
                ...(nip !== undefined && { nip: nip || null }),
                ...(namaLengkap && { namaLengkap }),
                ...(isActive !== undefined && { 
                    deletedAt: isActive ? null : new Date() 
                }),
            },
        })

        // Update user status
        if (isActive !== undefined) {
            await tx.user.update({
                where: { id: guru.userId },
                data: { isActive },
            })
        }

        // Update subjects (guruMapel)
        if (mapelIds !== undefined) {
            await tx.guruMapel.deleteMany({ where: { guruId: id } })
            if (mapelIds.length > 0) {
                await tx.guruMapel.createMany({
                    data: mapelIds.map((mId) => ({ guruId: id, mapelId: mId })),
                })
            }
        }

        // Update wali kelas assignment
        if (kelasId !== undefined) {
            await tx.kelas.updateMany({
                where: { waliKelasId: id },
                data: { waliKelasId: null },
            })

            if (kelasId) {
                await tx.kelas.update({
                    where: { id: kelasId },
                    data: { waliKelasId: id },
                })
            }
        }

        return tx.guru.findUnique({
            where: { id },
            include: {
                user: { select: { email: true, isActive: true } },
                guruMapel: { include: { mataPelajaran: true } },
                waliKelas: { select: { id: true, tingkat: true, namaKelas: true } },
            },
        })
    })

    return ok(updated, 200, "Data guru berhasil diperbarui")
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const guru = await prisma.guru.findUnique({ where: { id } })
    if (!guru || guru.deletedAt) return notFound("Guru tidak ditemukan")

    await prisma.$transaction([
        prisma.guru.update({
            where: { id },
            data: { deletedAt: new Date() },
        }),
        prisma.user.update({
            where: { id: guru.userId },
            data: { isActive: false },
        }),
    ])

    return ok(null, 200, "Guru berhasil dinonaktifkan")
}