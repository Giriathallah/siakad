import React from "react"
import KelasManager from "@/components/features/admin/KelasManager"

export const metadata = {
  title: "Master Data Kelas",
  description: "Kelola data master kelas, tingkat kelas, dan penugasan wali kelas.",
}

export default function AdminKelasPage() {
  return (
    <div className="w-full h-full p-4">
      <KelasManager />
    </div>
  )
}
