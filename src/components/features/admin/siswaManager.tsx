"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"
import { Pencil, UserPlus, Search, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import SiswaFormModal from "./siswaFormModal"

type Kelas = { id: string; tingkat: string; namaKelas: string }
type Siswa = {
    id: string
    nis: string
    nisn: string | null
    namaLengkap: string
    kelasId: string | null
    kelas: Kelas | null
    user: { email: string; isActive: boolean }
    deletedAt: string | Date | null
}

export default function SiswaManager() {
    const [siswaList, setSiswaList] = useState<Siswa[]>([])
    const [kelasList, setKelasList] = useState<Kelas[]>([])
    const [loading, setLoading] = useState(true)

    // Filter state
    const [search, setSearch] = useState("")
    const [filterKelas, setFilterKelas] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("nama_asc")

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [siswaToDelete, setSiswaToDelete] = useState<Siswa | null>(null)

    const fetchSiswa = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (filterKelas && filterKelas !== "all") params.set("kelasId", filterKelas)

        const result = await api.get<Siswa[]>(`/api/siswa?${params.toString()}`)
        if (result.success) {
            setSiswaList(result.data)
        } else {
            toast.error(result.error || "Gagal memuat data siswa")
        }
        setLoading(false)
    }, [search, filterKelas])

    const fetchKelas = useCallback(async () => {
        const result = await api.get<Kelas[]>("/api/kelas")
        if (result.success) setKelasList(result.data)
    }, [])

    useEffect(() => {
        fetchKelas()
    }, [fetchKelas])

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchSiswa()
        }, 300)
        return () => clearTimeout(timer)
    }, [fetchSiswa])

    const handleDeleteSubmit = async () => {
        if (!siswaToDelete) return
        setLoading(true)

        const result = await api.del(`/api/siswa/${siswaToDelete.id}`)
        if (result.success) {
            toast.success("Siswa berhasil dinonaktifkan")
            setIsDeleteOpen(false)
            fetchSiswa()
        } else {
            toast.error(result.error || "Gagal menonaktifkan siswa")
            setLoading(false)
        }
    }

    const openDelete = (siswa: Siswa) => {
        setSiswaToDelete(siswa)
        setIsDeleteOpen(true)
    }

    const handleEdit = (siswa: Siswa) => {
        setEditingSiswa(siswa)
        setIsModalOpen(true)
    }

    const handleAdd = () => {
        setEditingSiswa(null)
        setIsModalOpen(true)
    }

    // Client-side filtering and sorting
    const filteredList = siswaList.filter(siswa => {
        const isActiveSiswa = siswa.deletedAt === null && siswa.user.isActive
        
        if (statusFilter === "active") return isActiveSiswa
        if (statusFilter === "inactive") return !isActiveSiswa
        return true
    })

    const sortedList = [...filteredList].sort((a, b) => {
        if (sortOrder === "nama_asc") return a.namaLengkap.localeCompare(b.namaLengkap)
        if (sortOrder === "nama_desc") return b.namaLengkap.localeCompare(a.namaLengkap)
        if (sortOrder === "nis_asc") return a.nis.localeCompare(b.nis)
        if (sortOrder === "nis_desc") return b.nis.localeCompare(a.nis)
        return 0
    })

    return (
        <div className="w-full space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Data Siswa</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        Kelola data siswa terdaftar dalam sistem akademik.
                    </p>
                </div>
                <Button
                    onClick={handleAdd}
                    className="bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md gap-2"
                >
                    <UserPlus size={18} />
                    Tambah Siswa
                </Button>
            </div>

            {/* Filter Section */}
            <div className="bg-surface border border-outline-variant rounded-lg p-lg flex flex-col md:flex-row flex-wrap gap-md">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <Input
                        placeholder="Cari NIS atau Nama Siswa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20"
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Select value={filterKelas} onValueChange={setFilterKelas}>
                        <SelectTrigger className="w-full sm:w-[200px] font-body-md bg-surface-container-lowest border-outline-variant">
                            <SelectValue placeholder="Filter Kelas" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            <SelectItem value="all" className="font-body-md">Semua Kelas</SelectItem>
                            {kelasList.map((k) => (
                                <SelectItem key={k.id} value={k.id} className="font-body-md">
                                    Kelas {k.tingkat} - {k.namaKelas}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] font-body-md bg-surface-container-lowest border-outline-variant">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[160px] font-body-md bg-surface-container-lowest border-outline-variant">
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-container-lowest border-outline-variant">
                            <SelectItem value="nama_asc">Nama (A-Z)</SelectItem>
                            <SelectItem value="nama_desc">Nama (Z-A)</SelectItem>
                            <SelectItem value="nis_asc">NIS (Naik)</SelectItem>
                            <SelectItem value="nis_desc">NIS (Turun)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {/* Header tabel memiliki latar belakang warna terang (bg-surface-bright) */}
                            <tr className="bg-surface-bright border-b border-outline-variant">
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">NIS</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Nama Lengkap</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold hidden md:table-cell">Email</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Kelas</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-background">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-lg px-lg text-center text-on-surface-variant">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : sortedList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-lg px-lg text-center text-on-surface-variant">
                                        Tidak ada data siswa ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                sortedList.map((siswa) => (
                                    <tr key={siswa.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                        <td className="py-md px-lg text-on-surface-variant">{siswa.nis}</td>
                                        {/* Teks prioritas diberi aksen medium/bold */}
                                        <td className="py-md px-lg font-medium text-on-background">{siswa.namaLengkap}</td>
                                        <td className="py-md px-lg text-on-surface-variant hidden md:table-cell">{siswa.user.email}</td>
                                        <td className="py-md px-lg">
                                            {siswa.kelas ? (
                                                <span className="inline-flex items-center px-sm py-xs rounded border border-outline-variant bg-surface-bright text-on-surface-variant font-label-sm text-label-sm">
                                                    {siswa.kelas.tingkat} - {siswa.kelas.namaKelas}
                                                </span>
                                            ) : (
                                                <span className="text-on-surface-variant italic">-</span>
                                            )}
                                        </td>
                                        <td className="py-md px-lg">
                                            {/* Badge sukses menggunakan Emerald dengan latar Emerald opacity rendah */}
                                            {siswa.deletedAt === null && siswa.user.isActive ? (
                                                <span className="px-2 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold uppercase tracking-wide border border-secondary-container">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full bg-error-container/20 text-error text-[10px] font-bold uppercase tracking-wide border border-error-container">
                                                    {siswa.deletedAt ? "Dihapus" : "Nonaktif"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-md px-lg text-right">
                                            <div className="flex items-center justify-end gap-xs">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(siswa)} className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high" title="Edit Siswa">
                                                    <Pencil size={16} />
                                                </Button>
                                                {siswa.deletedAt === null && siswa.user.isActive && (
                                                    <Button variant="ghost" size="icon" onClick={() => openDelete(siswa)} className="text-on-surface-variant hover:text-error hover:bg-error-container/10" title="Nonaktifkan Siswa">
                                                        <UserX size={16} />
                                                    </Button>
                                                )}
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
            <SiswaFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSiswa}
                siswa={editingSiswa}
                kelasList={kelasList}
            />

            {/* Delete Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 bg-on-background/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-xl w-full max-w-[384px] shadow-lg flex flex-col p-lg text-center gap-md">
                        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-sm">
                            <UserX className="w-8 h-8" />
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Nonaktifkan Siswa?</h3>
                        <p className="font-body-md text-on-surface-variant">
                            Apakah Anda yakin ingin menonaktifkan akun <strong>{siswaToDelete?.namaLengkap}</strong>? Akun ini tidak akan bisa login lagi.
                        </p>
                        <div className="flex gap-3 justify-center mt-sm">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Batal</button>
                            <button onClick={handleDeleteSubmit} disabled={loading} className="px-4 py-2 font-label-md text-label-md bg-error text-on-error hover:bg-on-error-container rounded-lg transition-colors disabled:opacity-50">Ya, Nonaktifkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}