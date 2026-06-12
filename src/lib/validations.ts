// src/lib/validations.ts
import { z } from "zod"

// ═══════════════════════════════════════════
// COMMON
// ═══════════════════════════════════════════

const optionalString = z.string().optional()
const nullableString = z.string().nullable().optional()

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════

export const registerSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    role: z.enum(["ADMIN", "GURU", "SISWA"]).default("SISWA"),
})

// ═══════════════════════════════════════════
// SISWA
// ═══════════════════════════════════════════

export const createSiswaSchema = z.object({
    nis: z.string().min(1, "NIS wajib diisi"),
    nisn: optionalString,
    namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    kelasId: optionalString,
})

export const updateSiswaSchema = z.object({
    nis: z.string().min(1, "NIS tidak boleh kosong").optional(),
    nisn: nullableString,
    namaLengkap: z.string().min(1, "Nama lengkap tidak boleh kosong").optional(),
    kelasId: nullableString,
    isActive: z.boolean().optional(),
})

export const siswaQuerySchema = z.object({
    search: optionalString,
    kelasId: optionalString,
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
})

// ═══════════════════════════════════════════
// GURU
// ═══════════════════════════════════════════

export const createGuruSchema = z.object({
    nip: optionalString,
    namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    mapelIds: z.array(z.string()).optional(),
    kelasId: z.string().nullable().optional(),
})

export const updateGuruSchema = z.object({
    nip: nullableString,
    namaLengkap: z.string().min(1, "Nama lengkap tidak boleh kosong").optional(),
    isActive: z.boolean().optional(),
    mapelIds: z.array(z.string()).optional(),
    kelasId: z.string().nullable().optional(),
})

export const assignMapelSchema = z.object({
    mapelIds: z.array(z.string().min(1)).min(1, "Pilih minimal 1 mata pelajaran"),
})

export const guruQuerySchema = z.object({
    search: optionalString,
})

// ═══════════════════════════════════════════
// NILAI
// ═══════════════════════════════════════════

const nilaiField = z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100")

export const saveNilaiItemSchema = z.object({
    siswaId: z.string().min(1, "Siswa ID wajib"),
    mapelId: z.string().min(1, "Mapel ID wajib"),
    guruId: z.string().min(1, "Guru ID wajib"),
    tahunAjaranId: z.string().min(1, "Tahun ajaran ID wajib"),
    nilaiTugas: nilaiField,
    nilaiUts: nilaiField,
    nilaiUas: nilaiField,
})

export const saveNilaiBatchSchema = z
    .array(saveNilaiItemSchema)
    .min(1, "Minimal 1 data nilai")

export const updateNilaiSchema = z.object({
    nilaiTugas: nilaiField.optional(),
    nilaiUts: nilaiField.optional(),
    nilaiUas: nilaiField.optional(),
})

export const nilaiQuerySchema = z.object({
    mapelId: optionalString,
    kelasId: optionalString,
    tahunAjaranId: optionalString,
    siswaId: optionalString,
})

// ═══════════════════════════════════════════
// TAHUN AJARAN
// ═══════════════════════════════════════════

export const createTahunAjaranSchema = z.object({
    namaPeriode: z.string().min(1, "Nama periode wajib diisi"),
})

export const updateTahunAjaranSchema = z.object({
    namaPeriode: z.string().min(1, "Nama periode tidak boleh kosong").optional(),
})

// ═══════════════════════════════════════════
// MATA PELAJARAN
// ═══════════════════════════════════════════

export const createMapelSchema = z.object({
    kodeMapel: z.string().min(1, "Kode mapel wajib diisi"),
    namaMapel: z.string().min(1, "Nama mapel wajib diisi"),
    kkm: z.number().min(0).max(100).default(70),
})

export const updateMapelSchema = z.object({
    kodeMapel: z.string().min(1, "Kode mapel tidak boleh kosong").optional(),
    namaMapel: z.string().min(1, "Nama mapel tidak boleh kosong").optional(),
    kkm: z.number().min(0).max(100).optional(),
})

// ═══════════════════════════════════════════
// KELAS
// ═══════════════════════════════════════════

export const createKelasSchema = z.object({
    tingkat: z.string().min(1, "Tingkat wajib diisi"),
    namaKelas: z.string().min(1, "Nama kelas wajib diisi"),
    waliKelasId: optionalString,
})

export const updateKelasSchema = z.object({
    tingkat: z.string().min(1, "Tingkat tidak boleh kosong").optional(),
    namaKelas: z.string().min(1, "Nama kelas tidak boleh kosong").optional(),
    waliKelasId: nullableString,
})

// ═══════════════════════════════════════════
// LAPORAN QUERY
// ═══════════════════════════════════════════

export const laporanQuerySchema = z.object({
    tahunAjaranId: optionalString,
    kelasId: optionalString,
    mapelId: optionalString,
})

// ═══════════════════════════════════════════
// TYPE INFERENCE (export tipe dari schema)
// ═══════════════════════════════════════════

export type CreateSiswaInput = z.infer<typeof createSiswaSchema>
export type UpdateSiswaInput = z.infer<typeof updateSiswaSchema>
export type SiswaQueryInput = z.infer<typeof siswaQuerySchema>

export type CreateGuruInput = z.infer<typeof createGuruSchema>
export type UpdateGuruInput = z.infer<typeof updateGuruSchema>
export type AssignMapelInput = z.infer<typeof assignMapelSchema>

export type SaveNilaiBatchInput = z.infer<typeof saveNilaiBatchSchema>
export type UpdateNilaiInput = z.infer<typeof updateNilaiSchema>

export type CreateTahunAjaranInput = z.infer<typeof createTahunAjaranSchema>
export type CreateMapelInput = z.infer<typeof createMapelSchema>
export type UpdateMapelInput = z.infer<typeof updateMapelSchema>
export type CreateKelasInput = z.infer<typeof createKelasSchema>
export type UpdateKelasInput = z.infer<typeof updateKelasSchema>