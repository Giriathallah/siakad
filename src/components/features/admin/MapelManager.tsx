"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Mapel = {
    id: string
    kodeMapel: string
    namaMapel: string
    kkm: number
}

export default function MapelManager() {
    const [mapelList, setMapelList] = useState<Mapel[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    // Form / Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingMapel, setEditingMapel] = useState<Mapel | null>(null)
    const [formLoading, setFormLoading] = useState(false)

    // Form fields
    const [kodeMapel, setKodeMapel] = useState("")
    const [namaMapel, setNamaMapel] = useState("")
    const [kkm, setKkm] = useState<number | "">("")

    const fetchMapel = useCallback(async () => {
        setLoading(true)
        const result = await api.get<Mapel[]>("/api/guru/mapel")
        if (result.success) {
            setMapelList(result.data)
        } else {
            toast.error(result.error || "Gagal memuat data mata pelajaran")
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchMapel()
    }, [fetchMapel])

    const openAdd = () => {
        setEditingMapel(null)
        setKodeMapel("")
        setNamaMapel("")
        setKkm(70) // Default KKM
        setIsModalOpen(true)
    }

    const openEdit = (m: Mapel) => {
        setEditingMapel(m)
        setKodeMapel(m.kodeMapel)
        setNamaMapel(m.namaMapel)
        setKkm(m.kkm)
        setIsModalOpen(true)
    }

    const openDelete = (m: Mapel) => {
        setEditingMapel(m)
        setIsDeleteOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        const payload = {
            kodeMapel,
            namaMapel,
            kkm: typeof kkm === "number" ? kkm : parseInt(kkm || "0")
        }

        try {
            let result
            if (editingMapel) {
                result = await api.put(`/api/guru/mapel/${editingMapel.id}`, payload)
            } else {
                result = await api.post("/api/guru/mapel", payload)
            }

            if (result.success) {
                toast.success(result.message || "Berhasil menyimpan mata pelajaran")
                setIsModalOpen(false)
                fetchMapel()
            } else {
                toast.error(result.error || "Gagal menyimpan mata pelajaran")
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan")
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!editingMapel) return
        setFormLoading(true)

        try {
            const result = await api.del(`/api/guru/mapel/${editingMapel.id}`)
            if (result.success) {
                toast.success("Mata pelajaran berhasil dihapus")
                setIsDeleteOpen(false)
                fetchMapel()
            } else {
                toast.error(result.error || "Gagal menghapus mata pelajaran")
            }
        } catch {
            toast.error("Terjadi kesalahan")
        } finally {
            setFormLoading(false)
        }
    }

    // Client-side filtering
    const filteredList = mapelList.filter(mapel => 
        mapel.namaMapel.toLowerCase().includes(search.toLowerCase()) || 
        mapel.kodeMapel.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Master Mata Pelajaran</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Kelola data mata pelajaran beserta KKM.
                    </p>
                </div>
                <Button
                    onClick={openAdd}
                    className="bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md gap-2"
                >
                    <Plus size={18} />
                    Tambah Mapel
                </Button>
            </div>

            {/* Filter Section */}
            <div className="bg-surface border border-outline-variant rounded-lg p-lg">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <Input
                        placeholder="Cari Kode atau Nama Mapel..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold w-32">Kode Mapel</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Mapel</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center w-24">KKM</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-lg px-lg text-center text-on-surface-variant">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-lg px-lg text-center text-on-surface-variant">
                                        Tidak ada data mata pelajaran ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((m) => (
                                    <tr key={m.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-md px-lg font-semibold text-on-background">{m.kodeMapel}</td>
                                        <td className="py-md px-lg text-on-background">{m.namaMapel}</td>
                                        <td className="py-md px-lg text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm">
                                                {m.kkm}
                                            </span>
                                        </td>
                                        <td className="py-md px-lg text-right">
                                            <div className="flex items-center justify-end gap-xs">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(m)} className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high" title="Edit Mapel">
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openDelete(m)} className="text-on-surface-variant hover:text-error hover:bg-error-container/10" title="Hapus Mapel">
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
                                {editingMapel ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface">Kode Mapel <span className="text-error">*</span></label>
                                <Input 
                                    required 
                                    value={kodeMapel} 
                                    onChange={e => setKodeMapel(e.target.value)} 
                                    placeholder="Contoh: MAT, IPA, BIND"
                                    className="bg-surface border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase" 
                                />
                            </div>
                            
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface">Nama Mata Pelajaran <span className="text-error">*</span></label>
                                <Input 
                                    required 
                                    value={namaMapel} 
                                    onChange={e => setNamaMapel(e.target.value)} 
                                    placeholder="Contoh: Matematika Lanjut"
                                    className="bg-surface border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20" 
                                />
                            </div>

                            <div className="flex flex-col gap-xs">
                                <label className="font-label-sm text-label-sm text-on-surface">KKM (0-100) <span className="text-error">*</span></label>
                                <Input 
                                    required 
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={kkm} 
                                    onChange={e => setKkm(e.target.value ? Number(e.target.value) : "")} 
                                    placeholder="Contoh: 75"
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
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Hapus Mapel?</h3>
                        <p className="font-body-md text-on-surface-variant">
                            Apakah Anda yakin ingin menghapus mata pelajaran <strong>{editingMapel?.kodeMapel} - {editingMapel?.namaMapel}</strong>? Data yang dihapus tidak dapat dikembalikan.
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
