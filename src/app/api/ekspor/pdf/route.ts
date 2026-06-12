// Ekspor PDF route
import { NextRequest } from "next/server"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import prisma from "@/lib/prisma"
import { requireRole, getSearchParams } from "@/lib/api-response"
import { nilaiQuerySchema } from "@/lib/validations"
import { Prisma } from "@/generated/prisma/client"

export async function GET(request: NextRequest) {
    const auth = await requireRole("ADMIN", "GURU")
    if (!auth.ok) return auth.response

    const params = getSearchParams(request)
    const parsed = nilaiQuerySchema.safeParse(
        Object.fromEntries(params.entries())
    )
    if (!parsed.success) {
        return new Response("Parameter tidak valid", { status: 422 })
    }

    const { mapelId, kelasId, tahunAjaranId } = parsed.data

    const where: Prisma.NilaiWhereInput = {
        ...(mapelId && { mapelId }),
        ...(tahunAjaranId && { tahunAjaranId }),
        ...(kelasId && { siswa: { kelasId } }),
    }

    const nilaiList = await prisma.nilai.findMany({
        where,
        include: {
            siswa: { select: { nis: true, namaLengkap: true } },
            mataPelajaran: { select: { namaMapel: true, kkm: true } },
        },
        orderBy: { siswa: { namaLengkap: "asc" } },
    })

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Rekap Nilai Siswa", 14, 20)
    doc.setFontSize(10)
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 28)

    autoTable(doc, {
        startY: 35,
        head: [
            ["No", "NIS", "Nama", "Mapel", "Tugas", "UTS", "UAS", "Akhir", "Status"],
        ],
        body: nilaiList.map((n, i) => [
            i + 1,
            n.siswa.nis,
            n.siswa.namaLengkap,
            n.mataPelajaran.namaMapel,
            Number(n.nilaiTugas),
            Number(n.nilaiUts),
            Number(n.nilaiUas),
            Number(n.nilaiAkhir),
            n.statusLulus ? "LULUS" : "TIDAK LULUS",
        ]),
    })

    const buffer = Buffer.from(doc.output("arraybuffer"))

    return new Response(buffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="rekap-nilai.pdf"`,
        },
    })
}