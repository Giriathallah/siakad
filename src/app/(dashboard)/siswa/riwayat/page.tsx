import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import RiwayatClientUI from "@/components/features/siswa/RiwayatClientUI"

export const metadata = {
  title: "Riwayat Nilai & Rapor",
  description: "Pantau riwayat perolehan nilai akademik Anda dan ekspor laporan belajar (rapor) PDF/Excel.",
}

export default async function SiswaRiwayatPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || (session.user as any).role !== "SISWA") {
        redirect("/login")
    }

    const email = session.user.email
    const siswa = await prisma.siswa.findFirst({
        where: { user: { email } },
        include: {
            kelas: { select: { tingkat: true, namaKelas: true } }
        }
    })

    if (!siswa) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-on-surface-variant">Data siswa tidak ditemukan.</p>
            </div>
        )
    }

    // Ambil daftar Tahun Ajaran untuk dropdown filter (diurutkan descending)
    const initialTAData = await prisma.tahunAjaran.findMany({
        orderBy: { createdAt: "desc" }
    })
    
    const initialTA = initialTAData.map(t => ({
        id: t.id,
        namaPeriode: t.namaPeriode
    }))

    return (
        <div className="w-full h-full p-4">
            <RiwayatClientUI 
                siswa={{
                    id: siswa.id,
                    namaLengkap: siswa.namaLengkap,
                    nis: siswa.nis,
                    kelas: siswa.kelas
                }}
                initialTA={initialTA}
            />
        </div>
    )
}
