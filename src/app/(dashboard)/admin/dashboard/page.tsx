import prisma from "@/lib/prisma"
import { Users, GraduationCap, School, CalendarCheck } from "lucide-react"

export const metadata = {
  title: "Dashboard Admin",
  description: "Akses ringkasan data statistik sekolah, siswa aktif, dan guru pendidik.",
}

export default async function AdminDashboardPage() {
    // Memanggil data langsung via Prisma (Server Component) tanpa melalui route handler eksternal
    const [totalSiswa, totalGuru, totalKelas, tahunAjaranAktif, siswaTerbaru] =
        await Promise.all([
            prisma.siswa.count({ where: { deletedAt: null } }),
            prisma.guru.count({ where: { deletedAt: null } }),
            prisma.kelas.count(),
            prisma.tahunAjaran.findFirst({ where: { isActive: true } }),
            prisma.siswa.findMany({
                where: { deletedAt: null },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { kelas: { select: { namaKelas: true, tingkat: true } } },
            }),
        ])

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-xl">
                <h1 className="font-headline-lg text-headline-lg text-on-background">Dashboard Admin</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                    Ringkasan statistik dan aktivitas data akademik terkini.
                </p>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
                {/* Card 1: Total Siswa */}
                {/* Kartu data menggunakan bg-surface, padding p-lg (24px), dengan border-outline-variant[cite: 1] */}
                <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-start justify-between">
                    <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Total Siswa</p>
                        <p className="font-headline-lg text-headline-lg text-on-background">{totalSiswa}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                        <GraduationCap size={24} />
                    </div>
                </div>

                {/* Card 2: Total Guru */}
                <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-start justify-between">
                    <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Total Guru</p>
                        <p className="font-headline-lg text-headline-lg text-on-background">{totalGuru}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                        <Users size={24} />
                    </div>
                </div>

                {/* Card 3: Total Kelas */}
                <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-start justify-between">
                    <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Total Kelas</p>
                        <p className="font-headline-lg text-headline-lg text-on-background">{totalKelas}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                        <School size={24} />
                    </div>
                </div>

                {/* Card 4: Tahun Ajaran Aktif */}
                <div className="bg-surface border border-outline-variant rounded-lg p-lg flex items-start justify-between">
                    <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Tahun Ajaran</p>
                        {tahunAjaranAktif ? (
                            <p className="font-headline-sm text-headline-sm text-on-background truncate">
                                {tahunAjaranAktif.namaPeriode}
                            </p>
                        ) : (
                            <p className="font-body-md text-error">Belum diset</p>
                        )}
                        {/* Label sukses menggunakan teks Emerald dengan latar Emerald opacity rendah[cite: 1] */}
                        {tahunAjaranAktif && (
                            <span className="inline-block mt-2 px-2 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold uppercase tracking-wide border border-secondary-container">
                                Aktif
                            </span>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                        <CalendarCheck size={24} />
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            {/* Pembungkus tabel dengan border halus tanpa bayangan mencolok[cite: 1] */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="p-lg border-b border-outline-variant flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-on-background">Siswa Terdaftar Terbaru</h2>
                </div>
                <div className="overflow-x-auto">
                    {/* Data tables tidak memiliki garis pemisah vertikal, hanya horizontal[cite: 1] */}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {/* Header tabel memiliki latar belakang warna terang (F9FAFB/bg-surface-bright)[cite: 1] */}
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Lengkap</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">NIS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Kelas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Tanggal Masuk</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {siswaTerbaru.length > 0 ? (
                                siswaTerbaru.map((siswa) => (
                                    <tr key={siswa.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        {/* Teks di dalam tabel menggunakan ukuran 14px body standard dengan prioritas data yang diberi aksen bold[cite: 1] */}
                                        <td className="py-md px-lg font-medium text-on-background">{siswa.namaLengkap}</td>
                                        <td className="py-md px-lg text-on-surface-variant">{siswa.nis}</td>
                                        <td className="py-md px-lg">
                                            {siswa.kelas ? (
                                                <span className="inline-flex items-center px-sm py-xs rounded border border-outline-variant bg-surface-bright text-on-surface-variant font-label-sm text-label-sm">
                                                    Kelas {siswa.kelas.tingkat} - {siswa.kelas.namaKelas}
                                                </span>
                                            ) : (
                                                <span className="text-on-surface-variant italic">-</span>
                                            )}
                                        </td>
                                        <td className="py-md px-lg text-right text-on-surface-variant">
                                            {new Date(siswa.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-lg px-lg text-center text-on-surface-variant">
                                        Belum ada data siswa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}