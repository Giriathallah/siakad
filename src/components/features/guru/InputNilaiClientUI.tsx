"use client"

import { useState } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { Save, Filter, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type InputNilaiClientUIProps = {
    guruId: string
    initialMapels: { id: string, kodeMapel: string, namaMapel: string, kkm: number }[]
    initialKelas: { id: string, tingkat: string, namaKelas: string }[]
    initialTA: { id: string, namaPeriode: string }[]
    activeTA: string | null
}

type NilaiRow = {
    siswaId: string
    nis: string
    namaLengkap: string
    nilaiTugas: string | number
    nilaiUts: string | number
    nilaiUas: string | number
    nilaiAkhir: number
    statusLulus: boolean
    isModified: boolean // flag to know if we need to upsert
}

export default function InputNilaiClientUI({ guruId, initialMapels, initialKelas, initialTA, activeTA }: InputNilaiClientUIProps) {
    const [selectedMapel, setSelectedMapel] = useState<string>("")
    const [selectedKelas, setSelectedKelas] = useState<string>("")
    const [selectedTA, setSelectedTA] = useState<string>(activeTA || "")

    const [rows, setRows] = useState<NilaiRow[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [hasData, setHasData] = useState(false) // whether we have displayed the table
    const [currentKkm, setCurrentKkm] = useState<number>(70)

    const handleTampilkanSiswa = async () => {
        if (!selectedMapel || !selectedKelas || !selectedTA) {
            toast.error("Silakan pilih Mapel, Kelas, dan Tahun Ajaran")
            return
        }

        setIsFetching(true)
        const mapelObj = initialMapels.find(m => m.id === selectedMapel)
        if (mapelObj) setCurrentKkm(mapelObj.kkm)

        try {
            // Fetch all active students in class
            const siswaRes = await api.get<any[]>(`/api/siswa?kelasId=${selectedKelas}`)
            // Fetch existing grades
            const params = new URLSearchParams()
            params.append("kelasId", selectedKelas)
            params.append("mapelId", selectedMapel)
            params.append("tahunAjaranId", selectedTA)
            const nilaiRes = await api.get<any[]>(`/api/nilai?${params.toString()}`)

            if (siswaRes.success && nilaiRes.success) {
                const activeStudents = siswaRes.data.filter(s => s.deletedAt === null && s.user?.isActive)
                
                const existingGrades = new Map()
                nilaiRes.data.forEach(n => {
                    existingGrades.set(n.siswa.id, n)
                })

                const newRows: NilaiRow[] = activeStudents.map(siswa => {
                    const existing = existingGrades.get(siswa.id)
                    return {
                        siswaId: siswa.id,
                        nis: siswa.nis,
                        namaLengkap: siswa.namaLengkap,
                        nilaiTugas: existing ? existing.nilaiTugas : 0,
                        nilaiUts: existing ? existing.nilaiUts : 0,
                        nilaiUas: existing ? existing.nilaiUas : 0,
                        nilaiAkhir: existing ? existing.nilaiAkhir : 0,
                        statusLulus: existing ? existing.statusLulus : false,
                        isModified: false
                    }
                })

                setRows(newRows)
                setHasData(true)
            } else {
                toast.error("Gagal memuat data siswa atau nilai")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setIsFetching(false)
        }
    }

    const hitungNilaiAkhir = (tugas: number, uts: number, uas: number) => {
        return Math.round((0.3 * tugas + 0.3 * uts + 0.4 * uas) * 100) / 100
    }

    const handleNilaiChange = (index: number, field: "nilaiTugas" | "nilaiUts" | "nilaiUas", value: string) => {
        let numericValue = value === "" ? "" : Number(value)
        if (typeof numericValue === 'number' && numericValue > 100) numericValue = 100
        if (typeof numericValue === 'number' && numericValue < 0) numericValue = 0

        const newRows = [...rows]
        const row = { ...newRows[index], [field]: numericValue, isModified: true }
        
        // Auto Calculate
        const t = Number(row.nilaiTugas) || 0
        const uts = Number(row.nilaiUts) || 0
        const uas = Number(row.nilaiUas) || 0
        
        row.nilaiAkhir = hitungNilaiAkhir(t, uts, uas)
        row.statusLulus = row.nilaiAkhir >= currentKkm

        newRows[index] = row
        setRows(newRows)
    }

    const handleSimpan = async () => {
        if (!selectedMapel || !selectedTA) return

        // Validate all rows
        const itemsToSave = rows.map(r => ({
            siswaId: r.siswaId,
            mapelId: selectedMapel,
            guruId: guruId,
            tahunAjaranId: selectedTA,
            nilaiTugas: Number(r.nilaiTugas) || 0,
            nilaiUts: Number(r.nilaiUts) || 0,
            nilaiUas: Number(r.nilaiUas) || 0
        }))

        if (itemsToSave.length === 0) {
            toast.error("Tidak ada data siswa untuk disimpan")
            return
        }

        setIsSaving(true)
        try {
            const result = await api.post("/api/nilai", itemsToSave)
            if (result.success) {
                toast.success("Semua nilai berhasil disimpan!")
                // Reset isModified flags
                setRows(rows.map(r => ({ ...r, isModified: false })))
            } else {
                toast.error(result.error || "Gagal menyimpan nilai")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setIsSaving(false)
        }
    }

    if (initialMapels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-xl text-center">
                <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-md">
                    <AlertCircle size={32} />
                </div>
                <h2 className="font-headline-md text-on-surface mb-2">Belum Ada Mata Pelajaran</h2>
                <p className="text-on-surface-variant max-w-md">Anda belum diassign ke mata pelajaran apapun. Silakan hubungi admin sekolah untuk pengaturan mata pelajaran Anda.</p>
            </div>
        )
    }

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Input Nilai Siswa</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Pilih mapel, kelas, dan tahun ajaran untuk mulai memasukkan nilai. KKM Mapel otomatis akan digunakan sebagai acuan kelulusan.
                    </p>
                </div>
                {hasData && (
                    <Button
                        onClick={handleSimpan}
                        disabled={isSaving}
                        className="bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md gap-2"
                    >
                        <Save size={18} />
                        {isSaving ? "Menyimpan..." : "Simpan Semua Nilai"}
                    </Button>
                )}
            </div>

            {/* Filter Section */}
            <div className="bg-surface border border-outline-variant rounded-lg p-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
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

                    <div className="flex flex-col gap-2">
                        <Button 
                            onClick={handleTampilkanSiswa}
                            disabled={isFetching || !selectedMapel || !selectedKelas || !selectedTA}
                            variant="outline"
                            className="w-full border-primary text-primary hover:bg-primary-container font-label-md gap-2"
                        >
                            <Filter size={18} />
                            Tampilkan Siswa
                        </Button>
                    </div>
                </div>
            </div>

            {/* Data Table Section */}
            {hasData && (
                <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                    <div className="p-sm bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
                        <p className="font-label-sm text-on-surface-variant px-sm">
                            Menampilkan siswa untuk pengisian nilai. Bobot: Tugas 30%, UTS 30%, UAS 40%. KKM: {currentKkm}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-bright border-b border-outline-variant">
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold w-16">No</th>
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold w-32">NIS</th>
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Siswa</th>
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-28">Tugas</th>
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-28">UTS</th>
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-28">UAS</th>
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-24">Akhir</th>
                                    <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-md text-body-md text-on-background">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-lg px-lg text-center text-on-surface-variant">
                                            Tidak ada siswa aktif di kelas ini.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((r, i) => (
                                        <tr key={r.siswaId} className={`border-b border-outline-variant transition-colors ${r.isModified ? 'bg-primary/5' : 'hover:bg-surface-container-lowest'}`}>
                                            <td className="py-md px-lg text-on-surface-variant">{i + 1}</td>
                                            <td className="py-md px-lg text-on-surface-variant">{r.nis}</td>
                                            <td className="py-md px-lg font-medium text-on-background">{r.namaLengkap}</td>
                                            
                                            <td className="py-sm px-sm">
                                                <Input 
                                                    type="number"
                                                    min="0" max="100"
                                                    value={r.nilaiTugas}
                                                    onChange={(e) => handleNilaiChange(i, "nilaiTugas", e.target.value)}
                                                    className="w-full text-center h-9 text-sm"
                                                />
                                            </td>
                                            <td className="py-sm px-sm">
                                                <Input 
                                                    type="number"
                                                    min="0" max="100"
                                                    value={r.nilaiUts}
                                                    onChange={(e) => handleNilaiChange(i, "nilaiUts", e.target.value)}
                                                    className="w-full text-center h-9 text-sm"
                                                />
                                            </td>
                                            <td className="py-sm px-sm">
                                                <Input 
                                                    type="number"
                                                    min="0" max="100"
                                                    value={r.nilaiUas}
                                                    onChange={(e) => handleNilaiChange(i, "nilaiUas", e.target.value)}
                                                    className="w-full text-center h-9 text-sm"
                                                />
                                            </td>
                                            
                                            <td className="py-md px-lg text-center font-bold text-on-surface">{r.nilaiAkhir}</td>
                                            
                                            <td className="py-md px-lg text-center">
                                                {r.statusLulus ? (
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
            )}
        </div>
    )
}
