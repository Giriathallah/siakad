"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { Download, FileText, BarChart3, Users, BookOpen, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type LaporanData = {
    nilai: {
        id: string
        siswa: { nis: string; namaLengkap: string; kelas: { tingkat: string; namaKelas: string } | null }
        mataPelajaran: { namaMapel: string; kkm: number }
        tahunAjaran: { namaPeriode: string }
        guru: { namaLengkap: string }
        nilaiTugas: number
        nilaiUts: number
        nilaiUas: number
        nilaiAkhir: number
        statusLulus: boolean
    }[]
    summary: {
        total: number
        totalLulus: number
        totalTidakLulus: number
        rataRata: number
    }
}

type DropdownItem = { id: string; label: string }

export default function LaporanManager() {
    const [laporan, setLaporan] = useState<LaporanData | null>(null)
    const [loading, setLoading] = useState(true)

    // Filter states
    const [tahunAjaranList, setTahunAjaranList] = useState<DropdownItem[]>([])
    const [kelasList, setKelasList] = useState<DropdownItem[]>([])
    const [mapelList, setMapelList] = useState<DropdownItem[]>([])

    const [selectedTA, setSelectedTA] = useState<string>("")
    const [selectedKelas, setSelectedKelas] = useState<string>("all")
    const [selectedMapel, setSelectedMapel] = useState<string>("all")

    // Initialize dropdown options
    useEffect(() => {
        const initFilters = async () => {
            try {
                const [resTA, resKelas, resMapel] = await Promise.all([
                    api.get<any[]>("/api/tahun-ajaran"),
                    api.get<any[]>("/api/kelas"),
                    api.get<any[]>("/api/guru/mapel"),
                ])

                if (resTA.success) {
                    const ta = resTA.data
                    setTahunAjaranList(ta.map((t) => ({ id: t.id, label: t.namaPeriode })))
                    const activeTa = ta.find(t => t.isActive)
                    if (activeTa) {
                        setSelectedTA(activeTa.id)
                    } else if (ta.length > 0) {
                        setSelectedTA(ta[0].id)
                    }
                }

                if (resKelas.success) {
                    setKelasList(resKelas.data.map(k => ({ id: k.id, label: `${k.tingkat} - ${k.namaKelas}` })))
                }

                if (resMapel.success) {
                    setMapelList(resMapel.data.map(m => ({ id: m.id, label: m.namaMapel })))
                }
            } catch (err) {
                toast.error("Gagal memuat opsi filter")
            }
        }
        initFilters()
    }, [])

    const fetchLaporan = useCallback(async () => {
        if (!selectedTA) return // Wajib ada TA

        setLoading(true)
        const params = new URLSearchParams()
        params.append("tahunAjaranId", selectedTA)
        if (selectedKelas && selectedKelas !== "all") params.append("kelasId", selectedKelas)
        if (selectedMapel && selectedMapel !== "all") params.append("mapelId", selectedMapel)

        const result = await api.get<LaporanData>(`/api/admin/laporan?${params.toString()}`)
        if (result.success) {
            setLaporan(result.data)
        } else {
            toast.error(result.error || "Gagal memuat laporan")
        }
        setLoading(false)
    }, [selectedTA, selectedKelas, selectedMapel])

    useEffect(() => {
        if (selectedTA) {
            fetchLaporan()
        }
    }, [fetchLaporan, selectedTA]) // selectedTA triggers initially after load

    const handleExport = (type: "pdf" | "excel") => {
        if (!selectedTA) {
            toast.error("Tahun ajaran harus dipilih untuk ekspor")
            return
        }

        const params = new URLSearchParams()
        params.append("tahunAjaranId", selectedTA)
        if (selectedKelas && selectedKelas !== "all") params.append("kelasId", selectedKelas)
        if (selectedMapel && selectedMapel !== "all") params.append("mapelId", selectedMapel)

        const url = `/api/ekspor/${type}?${params.toString()}`
        window.open(url, "_blank")
    }

    const percentage = laporan?.summary.total ? Math.round((laporan.summary.totalLulus / laporan.summary.total) * 100) : 0

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Laporan Nilai Komprehensif</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Lihat rekapitulasi nilai seluruh siswa, statistik sekolah, dan ekspor data.
                    </p>
                </div>
                <div className="flex items-center gap-sm">
                    <Button
                        onClick={() => handleExport("excel")}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary-container font-label-md gap-2"
                        disabled={!selectedTA || loading}
                    >
                        <FileText size={18} />
                        Export Excel
                    </Button>
                    <Button
                        onClick={() => handleExport("pdf")}
                        className="bg-error text-on-error hover:bg-on-error-container font-label-md gap-2"
                        disabled={!selectedTA || loading}
                    >
                        <Download size={18} />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-surface border border-outline-variant rounded-lg p-lg grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Tahun Ajaran <span className="text-error">*</span></label>
                    <Select value={selectedTA} onValueChange={setSelectedTA}>
                        <SelectTrigger className="w-full font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Pilih Tahun Ajaran" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            {tahunAjaranList.map((ta) => (
                                <SelectItem key={ta.id} value={ta.id}>{ta.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Kelas</label>
                    <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                        <SelectTrigger className="w-full font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            <SelectItem value="all">Semua Kelas</SelectItem>
                            {kelasList.map((k) => (
                                <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Mata Pelajaran</label>
                    <Select value={selectedMapel} onValueChange={setSelectedMapel}>
                        <SelectTrigger className="w-full font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Semua Mapel" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            <SelectItem value="all">Semua Mapel</SelectItem>
                            {mapelList.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-label-sm text-on-surface-variant mb-1">Total Data</p>
                        <h4 className="font-headline-md text-on-surface">{laporan?.summary.total || 0}</h4>
                    </div>
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-label-sm text-on-surface-variant mb-1">Siswa Lulus</p>
                        <h4 className="font-headline-md text-on-surface">{laporan?.summary.totalLulus || 0}</h4>
                    </div>
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-label-sm text-on-surface-variant mb-1">Rata-Rata Nilai</p>
                        <h4 className="font-headline-md text-on-surface">{laporan?.summary.rataRata || 0}</h4>
                    </div>
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-label-sm text-on-surface-variant mb-1">Persentase Lulus</p>
                        <h4 className="font-headline-md text-on-surface">{percentage}%</h4>
                    </div>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">NIS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Siswa</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Kelas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Mapel</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Tugas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">UTS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">UAS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Akhir</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-lg px-lg text-center text-on-surface-variant">
                                        Memuat data laporan...
                                    </td>
                                </tr>
                            ) : !laporan || laporan.nilai.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-lg px-lg text-center text-on-surface-variant">
                                        Tidak ada data nilai pada periode/filter ini.
                                    </td>
                                </tr>
                            ) : (
                                laporan.nilai.map((n) => (
                                    <tr key={n.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-md px-lg text-on-surface-variant">{n.siswa.nis}</td>
                                        <td className="py-md px-lg font-medium text-on-background">{n.siswa.namaLengkap}</td>
                                        <td className="py-md px-lg text-on-surface-variant">
                                            {n.siswa.kelas ? `${n.siswa.kelas.tingkat} - ${n.siswa.kelas.namaKelas}` : '-'}
                                        </td>
                                        <td className="py-md px-lg text-on-surface-variant">{n.mataPelajaran.namaMapel}</td>

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
