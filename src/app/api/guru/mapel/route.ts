import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, created, err } from "@/lib/api-response"
import { createMapelSchema } from "@/lib/validations"

export async function GET() {
    const auth = await requireRole("ADMIN", "GURU", "SISWA")
    if (!auth.ok) return auth.response

    const data = await prisma.mataPelajaran.findMany({
        orderBy: { kodeMapel: "asc" },
    })

    return ok(data)
}

export async function POST(request: NextRequest) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const body = await validateBody(request, createMapelSchema)
    if (!body.ok) return body.response

    // Cek duplikasi kode
    const existing = await prisma.mataPelajaran.findUnique({
        where: { kodeMapel: body.data.kodeMapel },
    })
    if (existing) return err("Kode mapel sudah terdaftar", 409)

    const data = await prisma.mataPelajaran.create({
        data: {
            kodeMapel: body.data.kodeMapel,
            namaMapel: body.data.namaMapel,
            kkm: body.data.kkm,
        },
    })

    return created(data, "Mata pelajaran berhasil ditambahkan")
}