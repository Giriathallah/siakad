"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, CheckCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type TahunAjaran = {
    id: string
    namaPeriode: string
    isActive: boolean
}

export default function TahunAjaranManager() {
    const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")

    // Form / Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingTA, setEditingTA] = useState<TahunAjaran | null>(null)
    const [formLoading, setFormLoading] = useState(false)

    // Form fields
    const [namaPeriode, setNamaPeriode] = useState("")

    const fetchTahunAjaran = useCallback(async () => {
        setLoading(true)
        const result = await api.get<TahunAjaran[]>("/api/tahun-ajaran")
        if (result.success) {
            setTahunAjaranList(result.data)
        } else {
            toast.error(result.error || "Gagal memuat data tahun ajaran")
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchTahunAjaran()
    }, [fetchTahunAjaran])

    const openAdd = () => {
        setEditingTA(null)
        setNamaPeriode("")
        setIsModalOpen(true)
    }

    const openEdit = (ta: TahunAjaran) => {
        setEditingTA(ta)
        setNamaPeriode(ta.namaPeriode)
        setIsModalOpen(true)
    }

    const openDelete = (ta: TahunAjaran) => {
        setEditingTA(ta)
        setIsDeleteOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        const payload = { namaPeriode }

        try {
            let result
            if (editingTA) {
                result = await api.put(`/api/tahun-ajaran/${editingTA.id}`, payload)
            } else {
                result = await api.post("/api/tahun-ajaran", payload)
            }

            if (result.success) {
                toast.success(result.message || "Berhasil menyimpan tahun ajaran")
                setIsModalOpen(false)
                fetchTahunAjaran()
            } else {
                toast.error(result.error || "Gagal menyimpan tahun ajaran")
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!editingTA) return
        setFormLoading(true)

        try {
            const result = await api.del(`/api/tahun-ajaran/${editingTA.id}`)
            if (result.success) {
                toast.success("Tahun ajaran berhasil dihapus")
                setIsDeleteOpen(false)
                fetchTahunAjaran()
            } else {
                toast.error(result.error || "Gagal menghapus tahun ajaran")
            }
        } catch {
            toast.error("Terjadi kesalahan")
        } finally {
            setFormLoading(false)
        }
    }

    const handleActivate = async (id: string) => {
        setLoading(true)
        try {
            const result = await api.post(`/api/tahun-ajaran/${id}/activate`)
            if (result.success) {
                toast.success("Tahun ajaran berhasil diaktifkan")
                fetchTahunAjaran()
            } else {
                toast.error(result.error || "Gagal mengaktifkan tahun ajaran")
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setLoading(false)
        }
    }

    // Client-side filtering
    const filteredList = tahunAjaranList.filter(ta => {
        if (statusFilter === "active") return ta.isActive
        if (statusFilter === "inactive") return !ta.isActive
        return true
    })

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Master Tahun Ajaran</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Kelola periode belajar dan atur tahun ajaran mana yang sedang berjalan saat ini.
                    </p>
                </div>
                <Button
                    onClick={openAdd}
                    className="bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md gap-2"
                >
                    <Plus size={18} />
                    Tambah Periode
                </Button>
            </div>

            {/* Filter Section */}
            <div className="bg-surface border border-outline-variant rounded-lg p-lg flex flex-col md:flex-row gap-md">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px] font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-container-lowest border-outline-variant">
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table Section */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Periode</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="py-lg px-lg text-center text-on-surface-variant">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-lg px-lg text-center text-on-surface-variant">
                                        Tidak ada data tahun ajaran ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((ta) => (
                                    <tr key={ta.id} className={`border-b border-outline-variant transition-colors ${ta.isActive ? 'bg-primary/5' : 'hover:bg-surface-container-lowest'}`}>
                                        <td className="py-md px-lg">
                                            <span className={`font-semibold ${ta.isActive ? 'text-primary' : 'text-on-background'}`}>
                                                {ta.namaPeriode}
                                            </span>
                                            {ta.isActive && (
                                                <span className="ml-2 text-xs text-primary font-medium">(Sedang Berjalan)</span>
                                            )}
                                        </td>
                                        <td className="py-md px-lg">
                                            {ta.isActive ? (
                                                <span className="inline-flex items-center px-sm py-xs rounded-full bg-secondary-container/20 text-secondary border border-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wide">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-sm py-xs rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant font-label-sm text-[10px] font-bold uppercase tracking-wide">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-md px-lg text-right">
                                            <div className="flex items-center justify-end gap-xs">
                                                {!ta.isActive && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleActivate(ta.id)} className="text-secondary hover:text-secondary hover:bg-secondary-container/20" title="Aktifkan Periode">
                                                        <CheckCircle size={16} />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(ta)} className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high" title="Edit Periode">
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openDelete(ta)} className="text-on-surface-variant hover:text-error hover:bg-error-container/10" title="Hapus Periode">
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
                                {editingTA ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface">Nama Periode <span className="text-error">*</span></label>
                                <Input 
                                    required 
                                    value={namaPeriode} 
                                    onChange={e => setNamaPeriode(e.target.value)} 
                                    placeholder="Contoh: 2024/2025 Ganjil"
                                    className="bg-surface border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20" 
                                />
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
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Hapus Periode?</h3>
                        <p className="font-body-md text-on-surface-variant">
                            Apakah Anda yakin ingin menghapus periode <strong>{editingTA?.namaPeriode}</strong>? Data yang dihapus tidak dapat dikembalikan.
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
