"use client"

import React, { useState } from "react"
import { Search, Plus, Edit, UserX, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type GuruData = {
  id: string
  nip: string | null
  namaLengkap: string
  user: { email: string; isActive: boolean }
  guruMapel: { mataPelajaran: { id: string; namaMapel: string } }[]
  waliKelas: { id: string; tingkat: string; namaKelas: string }[]
  deletedAt: string | Date | null
}

export function GuruClientUI({ 
  initialData,
  mapelList = [],
  kelasList = []
}: { 
  initialData: GuruData[]
  mapelList?: { id: string; namaMapel: string }[]
  kelasList?: { id: string; tingkat: string; namaKelas: string }[]
}) {
  const router = useRouter()
  const [data, setData] = useState<GuruData[]>(initialData)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("nama_asc")
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedGuru, setSelectedGuru] = useState<GuruData | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState({ nip: "", namaLengkap: "", email: "", password: "", isActive: true })
  const [selectedMapelIds, setSelectedMapelIds] = useState<string[]>([])
  const [selectedKelasId, setSelectedKelasId] = useState<string>("none")

  // Filtering on client side
  const filteredData = data.filter(guru => {
    const matchesSearch = guru.namaLengkap.toLowerCase().includes(search.toLowerCase()) || 
                          (guru.nip && guru.nip.includes(search))
    
    const isActiveGuru = guru.deletedAt === null && guru.user.isActive
    
    if (statusFilter === "active") return matchesSearch && isActiveGuru
    if (statusFilter === "inactive") return matchesSearch && !isActiveGuru
    return matchesSearch
  })

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "nama_asc") return a.namaLengkap.localeCompare(b.namaLengkap)
    if (sortOrder === "nama_desc") return b.namaLengkap.localeCompare(a.namaLengkap)
    if (sortOrder === "nip_asc") return (a.nip || "").localeCompare(b.nip || "")
    if (sortOrder === "nip_desc") return (b.nip || "").localeCompare(a.nip || "")
    return 0
  })

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nip: formData.nip || null,
          namaLengkap: formData.namaLengkap,
          email: formData.email,
          password: formData.password,
          mapelIds: selectedMapelIds,
          kelasId: selectedKelasId === "none" ? null : selectedKelasId
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal menambahkan guru")
      
      toast.success("Guru berhasil ditambahkan")
      setIsAddOpen(false)
      router.refresh()
      // We can also optimistically update `data` here, but router.refresh() will re-fetch Server Component
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGuru) return
    setLoading(true)
    try {
      const res = await fetch(`/api/guru/${selectedGuru.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nip: formData.nip || null,
          namaLengkap: formData.namaLengkap,
          isActive: formData.isActive,
          mapelIds: selectedMapelIds,
          kelasId: selectedKelasId === "none" ? null : selectedKelasId
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal memperbarui guru")
      
      toast.success("Guru berhasil diperbarui")
      setIsEditOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedGuru) return
    setLoading(true)
    try {
      const res = await fetch(`/api/guru/${selectedGuru.id}`, {
        method: "DELETE"
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal menonaktifkan guru")
      
      toast.success("Guru berhasil dinonaktifkan")
      setIsDeleteOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setFormData({ nip: "", namaLengkap: "", email: "", password: "", isActive: true })
    setSelectedMapelIds([])
    setSelectedKelasId("none")
    setIsAddOpen(true)
  }

  const openEdit = (guru: GuruData) => {
    setSelectedGuru(guru)
    setFormData({ 
      nip: guru.nip || "", 
      namaLengkap: guru.namaLengkap, 
      email: guru.user.email,
      password: "",
      isActive: guru.user.isActive && guru.deletedAt === null 
    })
    setSelectedMapelIds(guru.guruMapel.map(gm => gm.mataPelajaran.id))
    setSelectedKelasId(guru.waliKelas[0]?.id || "none")
    setIsEditOpen(true)
  }

  const openDelete = (guru: GuruData) => {
    setSelectedGuru(guru)
    setIsDeleteOpen(true)
  }

  return (
    <div className="flex flex-col gap-lg">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-outline" />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-surface font-body-md border-outline-variant focus:border-primary focus:ring-primary/20">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-outline-variant font-body-md">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[160px] bg-surface font-body-md border-outline-variant focus:border-primary focus:ring-primary/20">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-outline-variant font-body-md">
              <SelectItem value="nama_asc">Nama (A-Z)</SelectItem>
              <SelectItem value="nama_desc">Nama (Z-A)</SelectItem>
              <SelectItem value="nip_asc">NIP (Naik)</SelectItem>
              <SelectItem value="nip_desc">NIP (Turun)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button 
          onClick={openAdd}
          className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Guru
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">NIP / Nama Guru</th>
                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Akun Email</th>
                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Penugasan</th>
                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {sortedData.length > 0 ? sortedData.map((guru) => (
                <tr key={guru.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="py-md px-lg">
                    <p className="font-medium text-on-background">{guru.namaLengkap}</p>
                    <p className="text-on-surface-variant text-sm">{guru.nip || "-"}</p>
                  </td>
                  <td className="py-md px-lg text-on-surface-variant">{guru.user.email}</td>
                  <td className="py-md px-lg">
                    <div className="flex flex-col gap-1">
                      {guru.waliKelas.length > 0 && (
                        <span className="inline-flex w-fit items-center px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                          Wali Kelas {guru.waliKelas.map(k => k.namaKelas).join(", ")}
                        </span>
                      )}
                      {guru.guruMapel.length > 0 ? (
                        <span className="text-on-surface-variant text-sm">
                          {guru.guruMapel.map(gm => gm.mataPelajaran.namaMapel).join(", ")}
                        </span>
                      ) : (
                        <span className="text-outline text-sm italic">Belum ada mapel</span>
                      )}
                    </div>
                  </td>
                  <td className="py-md px-lg">
                    {guru.deletedAt === null && guru.user.isActive ? (
                      <span className="inline-flex items-center px-sm py-xs rounded-full bg-secondary-container/20 text-secondary border border-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wide">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-sm py-xs rounded-full bg-error-container/20 text-error border border-error-container font-label-sm text-[10px] font-bold uppercase tracking-wide">
                        {guru.deletedAt ? "Dihapus" : "Nonaktif"}
                      </span>
                    )}
                  </td>
                  <td className="py-md px-lg text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(guru)} className="p-2 text-outline hover:text-primary transition-colors rounded-md hover:bg-surface-container" title="Edit Guru">
                        <Edit className="w-4 h-4" />
                      </button>
                      {guru.deletedAt === null && guru.user.isActive && (
                        <button onClick={() => openDelete(guru)} className="p-2 text-outline hover:text-error transition-colors rounded-md hover:bg-error-container/20" title="Nonaktifkan Guru">
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-lg px-lg text-center text-on-surface-variant">
                    Tidak ada data guru ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-on-background/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-[448px] shadow-lg flex flex-col">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Tambah Guru Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-lg flex flex-col gap-md max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">NIP (Opsional)</label>
                <input required={false} value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Nama Lengkap</label>
                <input required value={formData.namaLengkap} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* Mata Pelajaran Selection */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Mata Pelajaran yang Diajar</label>
                <div className="grid grid-cols-2 gap-sm border border-outline-variant rounded-lg p-md max-h-36 overflow-y-auto bg-surface">
                  {mapelList.map((mapel) => {
                    const isChecked = selectedMapelIds.includes(mapel.id)
                    return (
                      <label key={mapel.id} className="flex items-center gap-sm font-body-md text-on-surface hover:text-primary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMapelIds([...selectedMapelIds, mapel.id])
                            } else {
                              setSelectedMapelIds(selectedMapelIds.filter((id) => id !== mapel.id))
                            }
                          }}
                          className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary/20"
                        />
                        {mapel.namaMapel}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Wali Kelas Selection */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Penugasan Wali Kelas (Opsional)</label>
                <Select value={selectedKelasId} onValueChange={setSelectedKelasId}>
                  <SelectTrigger className="w-full bg-surface border border-outline-variant rounded-lg focus:ring-primary/20">
                    <SelectValue placeholder="Pilih Kelas (Opsional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-outline-variant font-body-md">
                    <SelectItem value="none">Belum Ditentukan (Kosong)</SelectItem>
                    {kelasList.map((kelas) => (
                      <SelectItem key={kelas.id} value={kelas.id}>
                        Kelas {kelas.tingkat} - {kelas.namaKelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-sm flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container rounded-lg transition-colors disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-on-background/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-[448px] shadow-lg flex flex-col">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Edit Data Guru</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-lg flex flex-col gap-md max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">NIP</label>
                <input value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Nama Lengkap</label>
                <input required value={formData.namaLengkap} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* Mata Pelajaran Selection */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Mata Pelajaran yang Diajar</label>
                <div className="grid grid-cols-2 gap-sm border border-outline-variant rounded-lg p-md max-h-36 overflow-y-auto bg-surface">
                  {mapelList.map((mapel) => {
                    const isChecked = selectedMapelIds.includes(mapel.id)
                    return (
                      <label key={mapel.id} className="flex items-center gap-sm font-body-md text-on-surface hover:text-primary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMapelIds([...selectedMapelIds, mapel.id])
                            } else {
                              setSelectedMapelIds(selectedMapelIds.filter((id) => id !== mapel.id))
                            }
                          }}
                          className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary/20"
                        />
                        {mapel.namaMapel}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Wali Kelas Selection */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface">Penugasan Wali Kelas (Opsional)</label>
                <Select value={selectedKelasId} onValueChange={setSelectedKelasId}>
                  <SelectTrigger className="w-full bg-surface border border-outline-variant rounded-lg focus:ring-primary/20">
                    <SelectValue placeholder="Pilih Kelas (Opsional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-outline-variant font-body-md">
                    <SelectItem value="none">Belum Ditentukan (Kosong)</SelectItem>
                    {kelasList.map((kelas) => (
                      <SelectItem key={kelas.id} value={kelas.id}>
                        Kelas {kelas.tingkat} - {kelas.namaKelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary bg-surface border-outline-variant rounded" />
                <label htmlFor="isActive" className="font-body-md text-on-surface">Akun Aktif</label>
              </div>
              <div className="pt-sm flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container rounded-lg transition-colors disabled:opacity-50">Perbarui</button>
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
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Nonaktifkan Guru?</h3>
            <p className="font-body-md text-on-surface-variant">
              Apakah Anda yakin ingin menonaktifkan akun <strong>{selectedGuru?.namaLengkap}</strong>? Akun ini tidak akan bisa login lagi.
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
