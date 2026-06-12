"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { Download, FileText, CheckCircle, XCircle, BarChart3, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type RekapNilaiClientUIProps = {
    guruId: string
    initialMapels: { id: string, namaMapel: string, kkm: number }[]
    initialKelas: { id: string, tingkat: string, namaKelas: string }[]
    initialTA: { id: string, namaPeriode: string }[]
    activeTA: string | null
}

type Nilai = {
    id: string
    siswa: { nis: string; namaLengkap: string }
    mataPelajaran: { namaMapel: string; kkm: number }
    nilaiTugas: number
    nilaiUts: number
    nilaiUas: number
    nilaiAkhir: number
    statusLulus: boolean
}

export default function RekapNilaiClientUI({ initialMapels, initialKelas, initialTA, activeTA }: RekapNilaiClientUIProps) {
    const [selectedMapel, setSelectedMapel] = useState<string>("")
    const [selectedKelas, setSelectedKelas] = useState<string>("")
    const [selectedTA, setSelectedTA] = useState<string>(activeTA || "")

    const [nilaiList, setNilaiList] = useState<Nilai[]>([])
    const [loading, setLoading] = useState(false)
    const [hasData, setHasData] = useState(false)

    // Derived Statistics
    const totalSiswa = nilaiList.length
    const totalLulus = nilaiList.filter(n => n.statusLulus).length
    const totalTidakLulus = totalSiswa - totalLulus
    const rataRata = totalSiswa > 0 
        ? Math.round((nilaiList.reduce((acc, curr) => acc + Number(curr.nilaiAkhir), 0) / totalSiswa) * 100) / 100
        : 0

    const fetchRekap = useCallback(async () => {
        if (!selectedMapel || !selectedKelas || !selectedTA) {
            setNilaiList([])
            setHasData(false)
            return
        }

        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append("kelasId", selectedKelas)
            params.append("mapelId", selectedMapel)
            params.append("tahunAjaranId", selectedTA)
            
            const result = await api.get<any[]>(`/api/nilai?${params.toString()}`)
            
            if (result.success) {
                setNilaiList(result.data)
                setHasData(true)
            } else {
                toast.error(result.error || "Gagal memuat rekap nilai")
                setNilaiList([])
                setHasData(false)
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setLoading(false)
        }
    }, [selectedMapel, selectedKelas, selectedTA])

    useEffect(() => {
        // Auto-fetch if all filters are selected
        if (selectedMapel && selectedKelas && selectedTA) {
            fetchRekap()
        }
    }, [selectedMapel, selectedKelas, selectedTA, fetchRekap])

    const handleExport = (type: "pdf" | "excel") => {
        if (!selectedMapel || !selectedKelas || !selectedTA) {
            toast.error("Pilih Mapel, Kelas, dan Tahun Ajaran terlebih dahulu")
            return
        }
        
        const params = new URLSearchParams()
        params.append("tahunAjaranId", selectedTA)
        params.append("kelasId", selectedKelas)
        params.append("mapelId", selectedMapel)

        const url = `/api/ekspor/${type}?${params.toString()}`
        window.open(url, "_blank")
    }

    if (initialMapels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-xl text-center">
                <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-md">
                    <AlertCircle size={32} />
                </div>
                <h2 className="font-headline-md text-on-surface mb-2">Belum Ada Mata Pelajaran</h2>
                <p className="text-on-surface-variant max-w-md">Anda belum diassign ke mata pelajaran apapun. Silakan hubungi admin sekolah.</p>
            </div>
        )
    }

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Rekap Nilai Siswa</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Lihat ringkasan nilai siswa, statistik kelulusan, dan unduh laporan.
                    </p>
                </div>
                <div className="flex items-center gap-sm">
                    <Button
                        onClick={() => handleExport("excel")}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary-container font-label-md gap-2"
                        disabled={!hasData || loading}
                    >
                        <FileText size={18} />
                        Export Excel
                    </Button>
                    <Button
                        onClick={() => handleExport("pdf")}
                        className="bg-error text-on-error hover:bg-on-error-container font-label-md gap-2"
                        disabled={!hasData || loading}
                    >
                        <Download size={18} />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-surface border border-outline-variant rounded-lg p-lg grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Mata Pelajaran <span className="text-error">*</span></label>
                    <Select value={selectedMapel} onValueChange={setSelectedMapel}>
                        <SelectTrigger className="w-full font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Pilih Mapel" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            {initialMapels.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.namaMapel} (KKM: {m.kkm})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Kelas <span className="text-error">*</span></label>
                    <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                        <SelectTrigger className="w-full font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            {initialKelas.map((k) => (
                                <SelectItem key={k.id} value={k.id}>{k.tingkat} - {k.namaKelas}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Tahun Ajaran <span className="text-error">*</span></label>
                    <Select value={selectedTA} onValueChange={setSelectedTA}>
                        <SelectTrigger className="w-full font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Pilih Tahun Ajaran" />
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

            {/* Summary Cards Section - Only show when data is present */}
            {hasData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                        <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-label-sm text-on-surface-variant mb-1">Jumlah Lulus</p>
                            <h4 className="font-headline-md text-on-surface">{totalLulus} Siswa</h4>
                        </div>
                    </div>
                    <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                        <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-label-sm text-on-surface-variant mb-1">Jumlah Tidak Lulus</p>
                            <h4 className="font-headline-md text-on-surface">{totalTidakLulus} Siswa</h4>
                        </div>
                    </div>
                    <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                        <div className="w-12 h-12 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-label-sm text-on-surface-variant mb-1">Rata-Rata Kelas</p>
                            <h4 className="font-headline-md text-on-surface">{rataRata}</h4>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table Section */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold w-16">No</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold w-32">NIS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Siswa</th>
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
                                    <td colSpan={8} className="py-lg px-lg text-center text-on-surface-variant">
                                        Memuat data rekap...
                                    </td>
                                </tr>
                            ) : !hasData ? (
                                <tr>
                                    <td colSpan={8} className="py-lg px-lg text-center text-on-surface-variant">
                                        Pilih Mapel, Kelas, dan Tahun Ajaran untuk melihat rekap nilai.
                                    </td>
                                </tr>
                            ) : nilaiList.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-lg px-lg text-center text-on-surface-variant">
                                        Tidak ada data nilai pada periode dan kelas ini.
                                    </td>
                                </tr>
                            ) : (
                                nilaiList.map((n, i) => (
                                    <tr key={n.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-md px-lg text-on-surface-variant">{i + 1}</td>
                                        <td className="py-md px-lg text-on-surface-variant">{n.siswa.nis}</td>
                                        <td className="py-md px-lg font-medium text-on-background">{n.siswa.namaLengkap}</td>
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
