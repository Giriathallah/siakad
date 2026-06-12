import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, created } from "@/lib/api-response"
import { createTahunAjaranSchema } from "@/lib/validations"

export async function GET() {
    const auth = await requireRole("ADMIN", "GURU", "SISWA")
    if (!auth.ok) return auth.response

    const data = await prisma.tahunAjaran.findMany({
        orderBy: { createdAt: "desc" },
    })

    return ok(data)
}

export async function POST(request: NextRequest) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const body = await validateBody(request, createTahunAjaranSchema)
    if (!body.ok) return body.response

    const data = await prisma.tahunAjaran.create({
        data: { namaPeriode: body.data.namaPeriode },
    })

    return created(data, "Tahun ajaran berhasil ditambahkan")
}