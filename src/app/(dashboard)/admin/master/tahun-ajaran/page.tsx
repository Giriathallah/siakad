import React from "react"
import TahunAjaranManager from "@/components/features/admin/TahunAjaranManager"

export const metadata = {
  title: "Master Data Tahun Ajaran",
  description: "Kelola data master tahun ajaran dan atur periode akademik aktif di SIAKAD.",
}

export default function AdminTahunAjaranPage() {
  return (
    <div className="w-full h-full p-4">
      <TahunAjaranManager />
    </div>
  )
}
