import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireRole, validateBody, ok, err } from "@/lib/api-response"
import { createSiswaSchema } from "@/lib/validations"
import { Prisma } from "@/generated/prisma/client"

export async function GET(request: NextRequest) {
    const check = await requireRole("ADMIN", "GURU")
    if (!check.ok) return check.response

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") ?? undefined
    const kelasId = searchParams.get("kelasId") ?? undefined

    const where: Prisma.SiswaWhereInput = {
        ...(kelasId ? { kelasId } : {}),
        ...(search
            ? {
                OR: [
                    { namaLengkap: { contains: search, mode: "insensitive" } },
                    { nis: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    }

    const siswaList = await prisma.siswa.findMany({
        where,
        include: {
            kelas: { select: { namaKelas: true, tingkat: true } },
            user: { select: { email: true, isActive: true } },
        },
        orderBy: { namaLengkap: "asc" },
    })

    return ok(siswaList)
}

export async function POST(request: NextRequest) {
    const check = await requireRole("ADMIN")
    if (!check.ok) return check.response

    const body = await validateBody(request, createSiswaSchema)
    if (!body.ok) return body.response

    const { nis, namaLengkap, email, password, kelasId, nisn } = body.data

    // Cek duplikasi NIS
    const existing = await prisma.siswa.findUnique({ where: { nis } })
    if (existing) return err("NIS sudah terdaftar", 409)

    // Buat akun via Better Auth lalu buat profil Siswa dalam transaksi
    const signUpResult = await auth.api.signUpEmail({
        body: { name: namaLengkap, email, password },
    })

    if (!signUpResult?.user?.id) {
        return err("Gagal membuat akun pengguna", 500)
    }

    const userId = signUpResult.user.id

    const siswa = await prisma.$transaction(async (tx) => {
        // Set role ke SISWA
        await tx.user.update({
            where: { id: userId },
            data: { role: "SISWA" },
        })

        return tx.siswa.create({
            data: {
                userId,
                nis,
                namaLengkap,
                nisn: nisn ?? null,
                kelasId: kelasId ?? null,
            },
        })
    })

    return ok(siswa, 201, "Siswa berhasil didaftarkan")
}

