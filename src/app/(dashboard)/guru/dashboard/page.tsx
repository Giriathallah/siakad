import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { BookOpen, School, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Dashboard Guru",
  description: "Lihat ringkasan tugas mengajar Anda dan daftar tugas input nilai yang tertunda.",
}

export default async function GuruDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || (session.user as any).role !== "GURU") {
        redirect("/login")
    }

    const email = session.user.email
    const guru = await prisma.guru.findFirst({
        where: { user: { email } },
        include: {
            guruMapel: { include: { mataPelajaran: true } },
            waliKelas: true,
        }
    })

    if (!guru) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-on-surface-variant">Data guru tidak ditemukan.</p>
            </div>
        )
    }

    const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
        where: { isActive: true },
    })

    const mapels = guru.guruMapel.map(gm => gm.mataPelajaran)
    const totalMapel = mapels.length

    // Mengambil semua kelas di sekolah (asumsi guru mengajar mapel tersebut di semua kelas)
    const semuaKelas = await prisma.kelas.findMany({
        include: { _count: { select: { siswa: { where: { deletedAt: null } } } } },
        orderBy: [{ tingkat: "asc" }, { namaKelas: "asc" }]
    })
    const totalKelas = semuaKelas.length

    // Mengambil nilai yang sudah diinput oleh guru ini di tahun ajaran aktif
    let belumDiinputList: { kelas: string, mapel: string, id: string }[] = []
    
    if (tahunAjaranAktif && totalMapel > 0 && totalKelas > 0) {
        const nilaiInputted = await prisma.nilai.findMany({
            where: {
                guruId: guru.id,
                tahunAjaranId: tahunAjaranAktif.id,
            },
            select: {
                mapelId: true,
                siswa: { select: { kelasId: true } }
            }
        })

        // Buat set untuk kombinasi Kelas-Mapel yang sudah ada nilainya
        const inputtedSet = new Set(
            nilaiInputted
                .filter(n => n.siswa.kelasId)
                .map(n => `${n.siswa.kelasId}-${n.mapelId}`)
        )

        // Cek kombinasi mana yang belum ada di set (dan kelas memiliki siswa)
        semuaKelas.forEach(kelas => {
            // Hanya kelas yang memiliki siswa aktif
            if (kelas._count.siswa > 0) {
                mapels.forEach(mapel => {
                    const key = `${kelas.id}-${mapel.id}`
                    if (!inputtedSet.has(key)) {
                        belumDiinputList.push({
                            id: key,
                            kelas: `${kelas.tingkat} - ${kelas.namaKelas}`,
                            mapel: mapel.namaMapel
                        })
                    }
                })
            }
        })
    }

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="mb-xl">
                <h1 className="font-headline-lg text-headline-lg text-on-background">Dashboard Guru</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                    Selamat datang, <span className="font-semibold text-on-surface">{guru.namaLengkap}</span>. Berikut adalah ringkasan aktivitas Anda.
                </p>
                {tahunAjaranAktif ? (
                    <div className="inline-flex items-center gap-2 mt-sm px-3 py-1.5 rounded-full bg-secondary-container/20 border border-secondary-container text-secondary">
                        <span className="font-label-sm font-bold uppercase tracking-wide">Periode Aktif:</span>
                        <span className="font-label-md">{tahunAjaranAktif.namaPeriode}</span>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 mt-sm px-3 py-1.5 rounded-full bg-error-container/20 border border-error-container text-error">
                        <AlertCircle size={14} />
                        <span className="font-label-sm font-bold tracking-wide">Belum ada Tahun Ajaran aktif</span>
                    </div>
                )}
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-xl">
                {/* Card 1: Mapel */}
                <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-start justify-between">
                    <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Mata Pelajaran Diampu</p>
                        <p className="font-headline-lg text-headline-lg text-on-background">{totalMapel}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                        <BookOpen size={24} />
                    </div>
                </div>

                {/* Card 2: Kelas */}
                <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-start justify-between">
                    <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Total Kelas</p>
                        <p className="font-headline-lg text-headline-lg text-on-background">{totalKelas}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                        <School size={24} />
                    </div>
                </div>
            </div>

            {/* Table Belum Diinput */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                    <h2 className="font-headline-sm text-headline-sm text-on-background">Menunggu Input Nilai</h2>
                </div>
                <div className="p-sm bg-error-container/10 border-b border-outline-variant">
                    <p className="font-body-sm text-on-surface-variant px-sm flex items-center gap-2">
                        <AlertCircle size={16} className="text-error" />
                        Daftar kelas dan mata pelajaran yang belum memiliki satupun nilai yang diinput pada tahun ajaran aktif.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Kelas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Mata Pelajaran</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {!tahunAjaranAktif ? (
                                <tr>
                                    <td colSpan={3} className="py-lg px-lg text-center text-on-surface-variant">
                                        Tidak dapat menampilkan data karena tidak ada tahun ajaran aktif.
                                    </td>
                                </tr>
                            ) : totalMapel === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-lg px-lg text-center text-on-surface-variant">
                                        Anda belum diassign ke mata pelajaran manapun.
                                    </td>
                                </tr>
                            ) : belumDiinputList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-lg px-lg text-center text-on-surface-variant">
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mb-3">
                                                <BookOpen size={24} />
                                            </div>
                                            <p className="font-medium text-on-surface">Luar Biasa!</p>
                                            <p className="text-sm">Semua nilai untuk kelas dan mapel Anda telah mulai diinput.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                belumDiinputList.map((item) => (
                                    <tr key={item.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-md px-lg font-medium text-on-background">{item.kelas}</td>
                                        <td className="py-md px-lg text-on-surface-variant">{item.mapel}</td>
                                        <td className="py-md px-lg">
                                            <span className="inline-flex items-center px-sm py-xs rounded bg-error-container/20 text-error border border-error-container font-label-sm text-[10px] font-bold uppercase tracking-wide">
                                                Belum Diinput
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
