import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, notFound } from "@/lib/api-response"
import { updateNilaiSchema } from "@/lib/validations"

type RouteContext = { params: Promise<{ id: string }> }

function hitungNilaiAkhir(tugas: number, uts: number, uas: number): number {
    return Math.round((0.3 * tugas + 0.3 * uts + 0.4 * uas) * 100) / 100
}

export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("GURU", "ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const body = await validateBody(request, updateNilaiSchema)
    if (!body.ok) return body.response

    const existing = await prisma.nilai.findUnique({
        where: { id },
        include: { mataPelajaran: true },
    })
    if (!existing) return notFound("Nilai tidak ditemukan")

    const tugas = body.data.nilaiTugas ?? Number(existing.nilaiTugas)
    const uts = body.data.nilaiUts ?? Number(existing.nilaiUts)
    const uas = body.data.nilaiUas ?? Number(existing.nilaiUas)

    const nilaiAkhir = hitungNilaiAkhir(tugas, uts, uas)
    const kkm = Number(existing.mataPelajaran.kkm)

    const updated = await prisma.nilai.update({
        where: { id },
        data: {
            nilaiTugas: tugas,
            nilaiUts: uts,
            nilaiUas: uas,
            nilaiAkhir,
            statusLulus: nilaiAkhir >= kkm,
        },
    })

    return ok(updated, 200, "Nilai berhasil diperbarui")
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const auth = await requireRole("GURU", "ADMIN")
    if (!auth.ok) return auth.response

    const { id } = await context.params
    const existing = await prisma.nilai.findUnique({ where: { id } })
    if (!existing) return notFound("Nilai tidak ditemukan")

    await prisma.nilai.delete({ where: { id } })
    return ok(null, 200, "Nilai berhasil dihapus")
}