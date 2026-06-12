"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { ChevronDown, ChevronUp, History, BookOpen, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type RiwayatClientUIProps = {
    siswa: {
        id: string
        namaLengkap: string
        nis: string
        kelas: { tingkat: string; namaKelas: string } | null
    }
    initialTA: { id: string, namaPeriode: string }[]
}

type Nilai = {
    id: string
    mataPelajaran: { namaMapel: string; kkm: number }
    tahunAjaran: { id: string; namaPeriode: string }
    nilaiTugas: number
    nilaiUts: number
    nilaiUas: number
    nilaiAkhir: number
    statusLulus: boolean
}

// Helper untuk mengelompokkan data
function groupByTahunAjaran(nilaiList: Nilai[]) {
    const grouped = new Map<string, { id: string, namaPeriode: string, items: Nilai[] }>()
    
    nilaiList.forEach(n => {
        const taId = n.tahunAjaran.id
        if (!grouped.has(taId)) {
            grouped.set(taId, {
                id: taId,
                namaPeriode: n.tahunAjaran.namaPeriode,
                items: []
            })
        }
        grouped.get(taId)!.items.push(n)
    })
    
    // Convert to array and sort by periode name desc (assuming newer is at top)
    return Array.from(grouped.values()).sort((a, b) => b.namaPeriode.localeCompare(a.namaPeriode))
}

export default function RiwayatClientUI({ siswa, initialTA }: RiwayatClientUIProps) {
    const [selectedTA, setSelectedTA] = useState<string>("all")
    const [allNilai, setAllNilai] = useState<Nilai[]>([])
    const [loading, setLoading] = useState(true)
    
    // State untuk accordion (id tahun ajaran yang terbuka)
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const fetchSemuaNilai = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch seluruh riwayat nilai siswa tanpa batasan tahun ajaran
            const result = await api.get<any[]>(`/api/nilai?siswaId=${siswa.id}`)
            if (result.success) {
                setAllNilai(result.data)
                
                // Secara default, buka semua accordion
                const grouped = groupByTahunAjaran(result.data)
                const initialOpenState: Record<string, boolean> = {}
                grouped.forEach(g => {
                    initialOpenState[g.id] = true
                })
                setOpenSections(initialOpenState)
            } else {
                toast.error(result.error || "Gagal memuat riwayat nilai")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setLoading(false)
        }
    }, [siswa.id])

    useEffect(() => {
        fetchSemuaNilai()
    }, [fetchSemuaNilai])

    // Data yang ditampilkan setelah di-filter
    const filteredNilai = selectedTA === "all" 
        ? allNilai 
        : allNilai.filter(n => n.tahunAjaran.id === selectedTA)
        
    const groupedData = groupByTahunAjaran(filteredNilai)

    const handleExportExcel = async () => {
        try {
            const XLSX = await import("xlsx")
            
            const wsData = [
                ["RIWAYAT NILAI AKADEMIK SISWA"],
                [],
                ["Nama Siswa:", siswa.namaLengkap],
                ["NIS:", siswa.nis],
                ["Kelas:", siswa.kelas ? `${siswa.kelas.tingkat} - ${siswa.kelas.namaKelas}` : "-"],
                [],
                ["Tahun Ajaran", "Mata Pelajaran", "KKM", "Tugas", "UTS", "UAS", "Nilai Akhir", "Status"]
            ]
            
            filteredNilai.forEach(n => {
                wsData.push([
                    n.tahunAjaran.namaPeriode,
                    n.mataPelajaran.namaMapel,
                    n.mataPelajaran.kkm.toString(),
                    Number(n.nilaiTugas).toString(),
                    Number(n.nilaiUts).toString(),
                    Number(n.nilaiUas).toString(),
                    Number(n.nilaiAkhir).toString(),
                    n.statusLulus ? "LULUS" : "TIDAK LULUS"
                ])
            })
            
            const ws = XLSX.utils.aoa_to_sheet(wsData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Riwayat Nilai")
            
            XLSX.writeFile(wb, `riwayat-nilai-${siswa.nis}.xlsx`)
            toast.success("Excel berhasil diekspor")
        } catch (error) {
            console.error("Gagal mengekspor Excel:", error)
            toast.error("Gagal mengekspor Excel")
        }
    }

    const handleExportPDF = async () => {
        try {
            const { default: jsPDF } = await import("jspdf")
            const { default: autoTable } = await import("jspdf-autotable")
            
            const doc = new jsPDF()
            
            // Header Title
            doc.setFont("Helvetica", "bold")
            doc.setFontSize(16)
            doc.text("RIWAYAT NILAI AKADEMIK SISWA", 14, 20)
            
            // Student Info
            doc.setFont("Helvetica", "normal")
            doc.setFontSize(10)
            doc.text(`Nama Siswa : ${siswa.namaLengkap}`, 14, 28)
            doc.text(`NIS        : ${siswa.nis}`, 14, 33)
            doc.text(`Kelas      : ${siswa.kelas ? `${siswa.kelas.tingkat} - ${siswa.kelas.namaKelas}` : "-"}`, 14, 38)
            doc.text(`Dicetak    : ${new Date().toLocaleDateString("id-ID")}`, 14, 43)
            
            // Table data
            autoTable(doc, {
                startY: 48,
                head: [
                    ["No", "Tahun Ajaran", "Mata Pelajaran", "KKM", "Tugas", "UTS", "UAS", "Akhir", "Status"],
                ],
                body: filteredNilai.map((n, i) => [
                    i + 1,
                    n.tahunAjaran.namaPeriode,
                    n.mataPelajaran.namaMapel,
                    n.mataPelajaran.kkm,
                    Number(n.nilaiTugas),
                    Number(n.nilaiUts),
                    Number(n.nilaiUas),
                    Number(n.nilaiAkhir),
                    n.statusLulus ? "LULUS" : "TIDAK LULUS",
                ]),
                theme: "striped",
                headStyles: { fillColor: [79, 70, 229] }, // Indigo / Primary style
            })
            
            doc.save(`riwayat-nilai-${siswa.nis}.pdf`)
            toast.success("PDF berhasil diekspor")
        } catch (error) {
            console.error("Gagal mengekspor PDF:", error)
            toast.error("Gagal mengekspor PDF")
        }
    }

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Riwayat Nilai Akademik</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Lihat seluruh histori nilai Anda sejak awal masuk sekolah.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-sm">
                    <div className="flex items-center gap-sm">
                        <Button 
                            onClick={handleExportExcel}
                            disabled={loading || filteredNilai.length === 0}
                            variant="outline" 
                            size="lg"
                            className="flex items-center gap-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Excel
                        </Button>
                        <Button 
                            onClick={handleExportPDF}
                            disabled={loading || filteredNilai.length === 0}
                            variant="outline" 
                            size="lg"
                            className="flex items-center gap-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border-rose-200 dark:border-rose-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                            <FileText className="w-4 h-4" />
                            PDF
                        </Button>
                    </div>
                    <div className="bg-surface border border-outline-variant rounded-lg p-2 flex items-center gap-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant ml-2">Filter Periode:</label>
                        <Select value={selectedTA} onValueChange={setSelectedTA}>
                            <SelectTrigger className="w-[200px] h-9 font-body-sm bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface-container-lowest border-outline-variant">
                                <SelectItem value="all">Semua Periode</SelectItem>
                                {initialTA.map((ta) => (
                                    <SelectItem key={ta.id} value={ta.id}>
                                        {ta.namaPeriode}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-md">
                {loading ? (
                    <div className="bg-surface border border-outline-variant rounded-lg p-xl text-center text-on-surface-variant">
                        Memuat riwayat nilai...
                    </div>
                ) : allNilai.length === 0 ? (
                    <div className="bg-surface border border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-md">
                            <History size={32} />
                        </div>
                        <h2 className="font-headline-md text-on-surface mb-2">Belum Ada Riwayat</h2>
                        <p className="text-on-surface-variant">Belum ada riwayat nilai yang tercatat untuk Anda di sistem ini.</p>
                    </div>
                ) : groupedData.length === 0 ? (
                    <div className="bg-surface border border-outline-variant rounded-lg p-xl text-center text-on-surface-variant">
                        Tidak ada data nilai untuk filter periode ini.
                    </div>
                ) : (
                    groupedData.map((group) => {
                        const isOpen = openSections[group.id]
                        return (
                            <div key={group.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden transition-all duration-300">
                                {/* Accordion Header */}
                                <button 
                                    onClick={() => toggleSection(group.id)}
                                    className="w-full p-md bg-surface-container-lowest border-b border-outline-variant hover:bg-surface-container-low transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                                            <BookOpen size={16} />
                                        </div>
                                        <h3 className="font-headline-sm text-on-surface">Tahun Ajaran: {group.namaPeriode}</h3>
                                        <span className="ml-2 px-2 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-medium">
                                            {group.items.length} Mapel
                                        </span>
                                    </div>
                                    <div className="text-on-surface-variant">
                                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </button>
                                
                                {/* Accordion Body */}
                                {isOpen && (
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
                                                {group.items.map((n) => (
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
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
