"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Guru = {
    id: string
    namaLengkap: string
}

type Kelas = {
    id: string
    tingkat: string
    namaKelas: string
    waliKelasId: string | null
    waliKelas: Guru | null
    _count: { siswa: number }
}

export default function KelasManager() {
    const [kelasList, setKelasList] = useState<Kelas[]>([])
    const [guruList, setGuruList] = useState<Guru[]>([])
    const [loading, setLoading] = useState(true)

    // Form / Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingKelas, setEditingKelas] = useState<Kelas | null>(null)
    const [formLoading, setFormLoading] = useState(false)

    // Form fields
    const [tingkat, setTingkat] = useState("")
    const [namaKelas, setNamaKelas] = useState("")
    const [waliKelasId, setWaliKelasId] = useState("none")

    const fetchKelas = useCallback(async () => {
        setLoading(true)
        const result = await api.get<Kelas[]>("/api/kelas")
        if (result.success) {
            setKelasList(result.data)
        } else {
            toast.error(result.error || "Gagal memuat data kelas")
        }
        setLoading(false)
    }, [])

    const fetchGuru = useCallback(async () => {
        const result = await api.get<Guru[]>("/api/guru")
        if (result.success) {
            setGuruList(result.data)
        }
    }, [])

    useEffect(() => {
        fetchKelas()
        fetchGuru()
    }, [fetchKelas, fetchGuru])

    const openAdd = () => {
        setEditingKelas(null)
        setTingkat("X")
        setNamaKelas("")
        setWaliKelasId("none")
        setIsModalOpen(true)
    }

    const openEdit = (k: Kelas) => {
        setEditingKelas(k)
        setTingkat(k.tingkat)
        setNamaKelas(k.namaKelas)
        setWaliKelasId(k.waliKelasId || "none")
        setIsModalOpen(true)
    }

    const openDelete = (k: Kelas) => {
        setEditingKelas(k)
        setIsDeleteOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        const payload = {
            tingkat,
            namaKelas,
            waliKelasId: waliKelasId === "none" ? null : waliKelasId
        }

        try {
            let result
            if (editingKelas) {
                result = await api.put(`/api/kelas/${editingKelas.id}`, payload)
            } else {
                result = await api.post("/api/kelas", payload)
            }

            if (result.success) {
                toast.success(result.message || "Berhasil menyimpan kelas")
                setIsModalOpen(false)
                fetchKelas()
            } else {
                toast.error(result.error || "Gagal menyimpan kelas")
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!editingKelas) return
        setFormLoading(true)

        try {
            const result = await api.del(`/api/kelas/${editingKelas.id}`)
            if (result.success) {
                toast.success("Kelas berhasil dihapus")
                setIsDeleteOpen(false)
                fetchKelas()
            } else {
                toast.error(result.error || "Gagal menghapus kelas")
            }
        } catch {
            toast.error("Terjadi kesalahan")
        } finally {
            setFormLoading(false)
        }
    }

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Master Data Kelas</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Kelola daftar kelas dan wali kelas.
                    </p>
                </div>
                <Button
                    onClick={openAdd}
                    className="bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md gap-2"
                >
                    <Plus size={18} />
                    Tambah Kelas
                </Button>
            </div>

            {/* Data Table Section */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold w-24">Tingkat</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Kelas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Wali Kelas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Jumlah Siswa</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-lg px-lg text-center text-on-surface-variant">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : kelasList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-lg px-lg text-center text-on-surface-variant">
                                        Belum ada data kelas.
                                    </td>
                                </tr>
                            ) : (
                                kelasList.map((k) => (
                                    <tr key={k.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-md px-lg font-semibold text-on-background">{k.tingkat}</td>
                                        <td className="py-md px-lg text-on-background">{k.namaKelas}</td>
                                        <td className="py-md px-lg">
                                            {k.waliKelas ? (
                                                <span className="text-on-surface-variant">{k.waliKelas.namaLengkap}</span>
                                            ) : (
                                                <span className="text-outline italic">Belum ditentukan</span>
                                            )}
                                        </td>
                                        <td className="py-md px-lg text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm">
                                                {k._count.siswa}
                                            </span>
                                        </td>
                                        <td className="py-md px-lg text-right">
                                            <div className="flex items-center justify-end gap-xs">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(k)} className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high" title="Edit Kelas">
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openDelete(k)} className="text-on-surface-variant hover:text-error hover:bg-error-container/10" title="Hapus Kelas">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-on-background/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-xl w-full max-w-[448px] shadow-lg flex flex-col">
                        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface">
                                {editingKelas ? "Edit Kelas" : "Tambah Kelas Baru"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface">Tingkat <span className="text-error">*</span></label>
                                <Select value={tingkat} onValueChange={setTingkat}>
                                    <SelectTrigger className="w-full bg-surface border border-outline-variant rounded-lg focus:ring-primary/20">
                                        <SelectValue placeholder="Pilih Tingkat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="X">Kelas 10 (X)</SelectItem>
                                        <SelectItem value="XI">Kelas 11 (XI)</SelectItem>
                                        <SelectItem value="XII">Kelas 12 (XII)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface">Nama Kelas <span className="text-error">*</span></label>
                                <Input 
                                    required 
                                    value={namaKelas} 
                                    onChange={e => setNamaKelas(e.target.value)} 
                                    placeholder="Contoh: MIPA 1, RPL A"
                                    className="bg-surface border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20" 
                                />
                            </div>

                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface">Wali Kelas</label>
                                <Select value={waliKelasId} onValueChange={setWaliKelasId}>
                                    <SelectTrigger className="w-full bg-surface border border-outline-variant rounded-lg focus:ring-primary/20">
                                        <SelectValue placeholder="Pilih Wali Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Belum Ditentukan</SelectItem>
                                        {guruList.map(g => (
                                            <SelectItem key={g.id} value={g.id}>{g.namaLengkap}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-sm flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Batal</button>
                                <button type="submit" disabled={formLoading} className="px-4 py-2 font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container rounded-lg transition-colors disabled:opacity-50">
                                    {formLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 bg-on-background/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-xl w-full max-w-[384px] shadow-lg flex flex-col p-lg text-center gap-md">
                        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-sm">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Hapus Kelas?</h3>
                        <p className="font-body-md text-on-surface-variant">
                            Apakah Anda yakin ingin menghapus kelas <strong>{editingKelas?.tingkat} {editingKelas?.namaKelas}</strong>? Data yang dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-3 justify-center mt-sm">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Batal</button>
                            <button onClick={handleDeleteSubmit} disabled={formLoading} className="px-4 py-2 font-label-md text-label-md bg-error text-on-error hover:bg-on-error-container rounded-lg transition-colors disabled:opacity-50">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
