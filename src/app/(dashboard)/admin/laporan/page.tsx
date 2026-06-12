import React from "react"
import LaporanManager from "@/components/features/admin/LaporanManager"

export const metadata = {
  title: "Laporan Nilai Sekolah",
  description: "Lihat rekapitulasi laporan nilai akademik seluruh kelas di SIAKAD.",
}

export default function AdminLaporanPage() {
  return (
    <div className="w-full h-full p-4">
      <LaporanManager />
    </div>
  )
}
