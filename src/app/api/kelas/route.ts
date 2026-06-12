import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, created } from "@/lib/api-response"
import { createKelasSchema } from "@/lib/validations"

export async function GET() {
    const auth = await requireRole("ADMIN", "GURU", "SISWA")
    if (!auth.ok) return auth.response

    const data = await prisma.kelas.findMany({
        include: {
            waliKelas: { select: { id: true, namaLengkap: true } },
            _count: { select: { siswa: { where: { deletedAt: null } } } },
        },
        orderBy: [{ tingkat: "asc" }, { namaKelas: "asc" }],
    })

    return ok(data)
}

export async function POST(request: NextRequest) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const body = await validateBody(request, createKelasSchema)
    if (!body.ok) return body.response

    const data = await prisma.kelas.create({
        data: {
            tingkat: body.data.tingkat,
            namaKelas: body.data.namaKelas,
            waliKelasId: body.data.waliKelasId ?? null,
        },
        include: {
            waliKelas: { select: { id: true, namaLengkap: true } },
        },
    })

    return created(data, "Kelas berhasil ditambahkan")
}