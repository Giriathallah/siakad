import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import InputNilaiClientUI from "@/components/features/guru/InputNilaiClientUI"

export const metadata = {
  title: "Input Nilai Siswa",
  description: "Entri nilai Tugas, UTS, dan UAS siswa secara batch/massal.",
}

export default async function GuruInputNilaiPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || (session.user as any).role !== "GURU") {
        redirect("/login")
    }

    const email = session.user.email
    const guru = await prisma.guru.findFirst({
        where: { user: { email } },
        include: {
            guruMapel: { include: { mataPelajaran: true } },
        }
    })

    if (!guru) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-on-surface-variant">Data guru tidak ditemukan.</p>
            </div>
        )
    }

    // Ambil daftar Mapel yang diassign ke Guru ini
    const initialMapels = guru.guruMapel.map(gm => ({
        id: gm.mataPelajaran.id,
        kodeMapel: gm.mataPelajaran.kodeMapel,
        namaMapel: gm.mataPelajaran.namaMapel,
        kkm: Number(gm.mataPelajaran.kkm)
    }))

    // Ambil daftar seluruh Kelas aktif di sekolah
    const initialKelasData = await prisma.kelas.findMany({
        orderBy: [{ tingkat: "asc" }, { namaKelas: "asc" }]
    })
    const initialKelas = initialKelasData.map(k => ({
        id: k.id,
        tingkat: k.tingkat,
        namaKelas: k.namaKelas
    }))

    // Ambil daftar Tahun Ajaran
    const initialTAData = await prisma.tahunAjaran.findMany({
        orderBy: { createdAt: "desc" }
    })
    const initialTA = initialTAData.map(t => ({
        id: t.id,
        namaPeriode: t.namaPeriode
    }))
    const activeTA = initialTAData.find(t => t.isActive)?.id || null

    return (
        <div className="w-full h-full p-4">
            <InputNilaiClientUI 
                guruId={guru.id}
                initialMapels={initialMapels}
                initialKelas={initialKelas}
                initialTA={initialTA}
                activeTA={activeTA}
            />
        </div>
    )
}
