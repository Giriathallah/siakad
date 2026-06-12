"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { BookOpen, CheckCircle, XCircle, BarChart3, AlertCircle } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type SiswaDashboardClientUIProps = {
    siswa: { id: string, namaLengkap: string, nis: string, kelas: { tingkat: string, namaKelas: string } | null }
    initialTA: { id: string, namaPeriode: string }[]
    activeTA: string | null
}

type Nilai = {
    id: string
    mataPelajaran: { namaMapel: string; kkm: number }
    nilaiTugas: number
    nilaiUts: number
    nilaiUas: number
    nilaiAkhir: number
    statusLulus: boolean
}

export default function SiswaDashboardClientUI({ siswa, initialTA, activeTA }: SiswaDashboardClientUIProps) {
    const [selectedTA, setSelectedTA] = useState<string>(activeTA || "")
    const [nilaiList, setNilaiList] = useState<Nilai[]>([])
    const [loading, setLoading] = useState(false)

    // Derived Statistics
    const totalMapel = nilaiList.length
    const totalLulus = nilaiList.filter(n => n.statusLulus).length
    const totalTidakLulus = totalMapel - totalLulus
    const rataRata = totalMapel > 0 
        ? Math.round((nilaiList.reduce((acc, curr) => acc + Number(curr.nilaiAkhir), 0) / totalMapel) * 100) / 100
        : 0

    const fetchNilai = useCallback(async () => {
        if (!selectedTA) return

        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append("siswaId", siswa.id)
            params.append("tahunAjaranId", selectedTA)
            
            const result = await api.get<any[]>(`/api/nilai?${params.toString()}`)
            
            if (result.success) {
                setNilaiList(result.data)
            } else {
                toast.error(result.error || "Gagal memuat nilai")
                setNilaiList([])
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setLoading(false)
        }
    }, [selectedTA, siswa.id])

    useEffect(() => {
        if (selectedTA) {
            fetchNilai()
        }
    }, [selectedTA, fetchNilai])

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Dashboard Siswa</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Selamat datang, <span className="font-semibold text-on-surface">{siswa.namaLengkap}</span>. 
                        NIS: {siswa.nis} | Kelas: {siswa.kelas ? `${siswa.kelas.tingkat} - ${siswa.kelas.namaKelas}` : '-'}
                    </p>
                </div>
                <div className="bg-surface border border-outline-variant rounded-lg p-2 flex items-center gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant ml-2">Tahun Ajaran:</label>
                    <Select value={selectedTA} onValueChange={setSelectedTA}>
                        <SelectTrigger className="w-[200px] h-9 font-body-sm bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Pilih Periode" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            {initialTA.map((ta) => (
                                <SelectItem key={ta.id} value={ta.id}>
                                    {ta.namaPeriode} {ta.id === activeTA ? "(Aktif)" : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {/* Card 1: Rata-Rata */}
                <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-label-sm text-on-surface-variant mb-1">Rata-Rata Nilai Akhir</p>
                        <h4 className="font-headline-md text-on-surface">{rataRata}</h4>
                    </div>
                </div>

                {/* Card 2: Lulus */}
                <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-label-sm text-on-surface-variant mb-1">Mapel Lulus</p>
                        <h4 className="font-headline-md text-on-surface">{totalLulus} Mapel</h4>
                    </div>
                </div>

                {/* Card 3: Tidak Lulus */}
                <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-label-sm text-on-surface-variant mb-1">Mapel Tidak Lulus</p>
                        <h4 className="font-headline-md text-on-surface">{totalTidakLulus} Mapel</h4>
                    </div>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                    <h2 className="font-headline-sm text-headline-sm text-on-background">Nilai Semester Ini</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Mata Pelajaran</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-24">Tugas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-24">UTS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-24">UAS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-28">Nilai Akhir</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-lg px-lg text-center text-on-surface-variant">
                                        Memuat data nilai...
                                    </td>
                                </tr>
                            ) : !selectedTA ? (
                                <tr>
                                    <td colSpan={6} className="py-lg px-lg text-center text-on-surface-variant">
                                        Pilih tahun ajaran untuk melihat nilai.
                                    </td>
                                </tr>
                            ) : nilaiList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-lg px-lg text-center text-on-surface-variant">
                                        <div className="flex flex-col items-center justify-center py-6">
                                            <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-3">
                                                <BookOpen size={24} />
                                            </div>
                                            <p className="font-medium text-on-surface">Belum Ada Nilai</p>
                                            <p className="text-sm">Nilai untuk periode ini belum diinput oleh guru.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                nilaiList.map((n) => (
                                    <tr key={n.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-md px-lg">
                                            <span className="font-medium text-on-background">{n.mataPelajaran.namaMapel}</span>
                                            <span className="ml-2 text-xs text-on-surface-variant">(KKM: {n.mataPelajaran.kkm})</span>
                                        </td>
                                        <td className="py-md px-lg text-center">{Number(n.nilaiTugas)}</td>
                                        <td className="py-md px-lg text-center">{Number(n.nilaiUts)}</td>
                                        <td className="py-md px-lg text-center">{Number(n.nilaiUas)}</td>
                                        <td className="py-md px-lg text-center font-bold text-on-surface">{Number(n.nilaiAkhir)}</td>
                                        <td className="py-md px-lg text-center">
                                            {n.statusLulus ? (
                                                <span className="inline-flex items-center px-sm py-xs rounded bg-secondary-container/20 text-secondary border border-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wide">
                                                    LULUS
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-sm py-xs rounded bg-error-container/20 text-error border border-error-container font-label-sm text-[10px] font-bold uppercase tracking-wide">
                                                    TIDAK LULUS
                                                </span>
                                            )}
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
