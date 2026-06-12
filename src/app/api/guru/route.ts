import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, created, err, getSearchParams } from "@/lib/api-response"
import { createGuruSchema, guruQuerySchema } from "@/lib/validations"
import { Prisma } from "@/generated/prisma/client"

export async function GET(request: NextRequest) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const params = getSearchParams(request)
    const parsed = guruQuerySchema.safeParse(Object.fromEntries(params.entries()))

    if (!parsed.success) {
        return err(parsed.error.issues[0]?.message || "Parameter tidak valid", 422)
    }
    const { search } = parsed.data

    const where: Prisma.GuruWhereInput = {
        deletedAt: null,
        ...(search && {
            OR: [
                { namaLengkap: { contains: search, mode: "insensitive" } },
                { nip: { contains: search, mode: "insensitive" } },
            ],
        }),
    }

    const guruList = await prisma.guru.findMany({
        where,
        include: {
            user: { select: { email: true, isActive: true } },
            guruMapel: { include: { mataPelajaran: true } },
            waliKelas: { select: { id: true, tingkat: true, namaKelas: true } },
        },
        orderBy: { namaLengkap: "asc" },
    })

    return ok(guruList)
}

export async function POST(request: NextRequest) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const body = await validateBody(request, createGuruSchema)
    if (!body.ok) return body.response

    const { nip, namaLengkap, email, password, mapelIds, kelasId } = body.data

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return err("Email sudah terdaftar", 409)

    if (nip) {
        const existingNip = await prisma.guru.findUnique({ where: { nip } })
        if (existingNip) return err("NIP sudah terdaftar", 409)
    }

    const guru = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: namaLengkap,
                email,
                role: "GURU",
                emailVerified: true,
                accounts: {
                    create: {
                        accountId: email,
                        providerId: "credential",
                        password,
                    },
                },
            },
        })

        const newGuru = await tx.guru.create({
            data: {
                nip: nip ?? null,
                namaLengkap,
                userId: user.id,
                ...(mapelIds && mapelIds.length > 0 && {
                    guruMapel: {
                        create: mapelIds.map((mId) => ({ mapelId: mId })),
                    },
                }),
            },
        })

        if (kelasId) {
            await tx.kelas.update({
                where: { id: kelasId },
                data: { waliKelasId: newGuru.id },
            })
        }

        return tx.guru.findUnique({
            where: { id: newGuru.id },
            include: {
                user: { select: { email: true, isActive: true } },
                guruMapel: { include: { mataPelajaran: true } },
                waliKelas: { select: { id: true, tingkat: true, namaKelas: true } },
            },
        })
    })

    return created(guru)
}