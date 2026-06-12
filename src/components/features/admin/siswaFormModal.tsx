"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/fetcher"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

type Kelas = { id: string; tingkat: string; namaKelas: string }
type Siswa = {
    id: string
    nis: string
    nisn: string | null
    namaLengkap: string
    kelasId: string | null
    user: { email: string; isActive: boolean }
    deletedAt?: string | Date | null
}

type Props = {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    siswa: Siswa | null
    kelasList: Kelas[]
}

export default function SiswaFormModal({ isOpen, onClose, onSuccess, siswa, kelasList }: Props) {
    const [loading, setLoading] = useState(false)

    // Form State
    const [nis, setNis] = useState(siswa?.nis || "")
    const [namaLengkap, setNamaLengkap] = useState(siswa?.namaLengkap || "")
    const [email, setEmail] = useState(siswa?.user?.email || "")
    const [password, setPassword] = useState("")
    const [nisn, setNisn] = useState(siswa?.nisn || "")
    const [kelasId, setKelasId] = useState(siswa?.kelasId || "none")
    const [isActive, setIsActive] = useState(siswa ? siswa.user?.isActive : true)

    // Reset form ketika modal dibuka/diganti
    useEffect(() => {
        if (isOpen) {
            setNis(siswa?.nis || "")
            setNamaLengkap(siswa?.namaLengkap || "")
            setEmail(siswa?.user?.email || "")
            setPassword("")
            setNisn(siswa?.nisn || "")
            setKelasId(siswa?.kelasId || "none")
            // Active if no siswa (new) or if it's active and not deleted
            setIsActive(siswa ? (siswa.user?.isActive && !siswa.deletedAt) : true)
        }
    }, [isOpen, siswa])

    const handleOpenChange = (open: boolean) => {
        if (!open) onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: any = {
            nis,
            namaLengkap,
            email,
            nisn: nisn || undefined,
            kelasId: kelasId === "none" ? null : kelasId,
            isActive
        }

        try {
            let result;
            if (siswa) {
                // UPDATE (PATCH)
                result = await api.patch(`/api/siswa/${siswa.id}`, payload)
            } else {
                // CREATE (POST)
                if (!password || password.length < 8) {
                    toast.error("Password wajib diisi minimal 8 karakter untuk siswa baru")
                    setLoading(false)
                    return
                }
                payload.password = password
                result = await api.post("/api/siswa", payload)
            }

            if (result.success) {
                toast.success(result.message || (siswa ? "Data diperbarui" : "Siswa didaftarkan"))
                onSuccess()
                onClose()
            } else {
                toast.error(result.error || "Terjadi kesalahan")
            }
        } catch {
            toast.error("Gagal mengirim data")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-surface border border-outline-variant sm:max-w-[480px] p-0 overflow-hidden">
                {/* Dialog Header mengikuti aturan padding p-lg dan border bawah */}
                <div className="p-lg border-b border-outline-variant">
                    <DialogHeader>
                        <DialogTitle className="font-headline-sm text-headline-sm text-on-background">
                            {siswa ? "Edit Data Siswa" : "Registrasi Siswa Baru"}
                        </DialogTitle>
                        <DialogDescription className="font-body-md text-body-md text-on-surface-variant mt-xs">
                            {siswa ? "Perbarui informasi siswa." : "Isi form berikut untuk menambahkan siswa ke sistem."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                        <div className="space-y-xs">
                            <label className="font-label-sm text-label-sm text-on-surface">NIS <span className="text-error">*</span></label>
                            <Input
                                value={nis}
                                onChange={(e) => setNis(e.target.value)}
                                required
                                className="font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-xs">
                            <label className="font-label-sm text-label-sm text-on-surface">NISN</label>
                            <Input
                                value={nisn}
                                onChange={(e) => setNisn(e.target.value)}
                                className="font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-xs">
                        <label className="font-label-sm text-label-sm text-on-surface">Nama Lengkap <span className="text-error">*</span></label>
                        <Input
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            required
                            className="font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-xs">
                        <label className="font-label-sm text-label-sm text-on-surface">Email <span className="text-error">*</span></label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={!!siswa} // Email tidak bisa diganti di Better Auth semudah itu
                            className="font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                    </div>

                    {!siswa && (
                        <div className="space-y-xs">
                            <label className="font-label-sm text-label-sm text-on-surface">Password <span className="text-error">*</span></label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!siswa}
                                minLength={8}
                                placeholder="Minimal 8 karakter"
                                className="font-body-md bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                    )}

                    <div className="space-y-xs">
                        <label className="font-label-sm text-label-sm text-on-surface">Kelas</label>
                        <Select value={kelasId} onValueChange={setKelasId}>
                            <SelectTrigger className="font-body-md bg-surface-container-lowest border-outline-variant">
                                <SelectValue placeholder="Pilih Kelas" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface-container-lowest border-outline-variant">
                                <SelectItem value="none" className="font-body-md">Tidak Ada Kelas</SelectItem>
                                {kelasList.map((k) => (
                                    <SelectItem key={k.id} value={k.id} className="font-body-md">
                                        Kelas {k.tingkat} - {k.namaKelas}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {siswa && (
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-primary bg-surface border-outline-variant rounded" />
                            <label htmlFor="isActive" className="font-body-md text-on-surface">Akun Aktif</label>
                        </div>
                    )}

                    <div className="flex justify-end gap-md pt-sm">
                        <Button type="button" variant="outline" onClick={onClose} className="border-outline-variant text-on-surface-variant hover:bg-surface-container-high font-label-md">
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md">
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}