import React from "react"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-response"
import { redirect } from "next/navigation"
import { GuruClientUI } from "@/components/features/admin/GuruClientUI"

export const metadata = {
  title: "Manajemen Data Guru",
  description: "Kelola data registrasi guru, tugas mata pelajaran, dan wali kelas di SIAKAD.",
}

export default async function AdminGuruPage() {
  const auth = await requireRole("ADMIN")
  if (!auth.ok) {
    redirect("/login")
  }

  // Fetch all gurus, subjects, and classes
  const [guruList, mapelList, kelasList] = await Promise.all([
    prisma.guru.findMany({
      include: {
        user: { select: { email: true, isActive: true } },
        guruMapel: { include: { mataPelajaran: { select: { id: true, namaMapel: true } } } },
        waliKelas: { select: { id: true, tingkat: true, namaKelas: true } },
      },
      orderBy: { namaLengkap: "asc" },
    }),
    prisma.mataPelajaran.findMany({
      select: { id: true, namaMapel: true },
      orderBy: { namaMapel: "asc" },
    }),
    prisma.kelas.findMany({
      select: { id: true, tingkat: true, namaKelas: true },
      orderBy: [{ tingkat: "asc" }, { namaKelas: "asc" }],
    }),
  ])

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Data Guru</h1>
        <p className="font-body-md text-on-surface-variant">
          Kelola data guru, tugas mengajar, dan hak akses akun.
        </p>
      </div>
      
      <GuruClientUI 
        initialData={guruList} 
        mapelList={mapelList}
        kelasList={kelasList}
      />
    </div>
  )
}
