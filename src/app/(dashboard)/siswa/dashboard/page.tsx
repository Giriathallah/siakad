import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import SiswaDashboardClientUI from "@/components/features/siswa/SiswaDashboardClientUI"

export const metadata = {
  title: "Dashboard Siswa",
  description: "Lihat ringkasan prestasi belajar, statistik mata pelajaran lulus, dan rekap nilai Anda.",
}

export default async function SiswaDashboardPage() {
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
            <SiswaDashboardClientUI 
                siswa={{
                    id: siswa.id,
                    namaLengkap: siswa.namaLengkap,
                    nis: siswa.nis,
                    kelas: siswa.kelas
                }}
                initialTA={initialTA}
                activeTA={activeTA}
            />
        </div>
    )
}
