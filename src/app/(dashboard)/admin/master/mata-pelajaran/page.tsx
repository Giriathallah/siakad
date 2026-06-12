import React from "react"
import MapelManager from "@/components/features/admin/MapelManager"

export const metadata = {
  title: "Master Data Mata Pelajaran",
  description: "Kelola data master mata pelajaran, kode mapel, dan KKM di SIAKAD.",
}

export default function AdminMataPelajaranPage() {
  return (
    <div className="w-full h-full p-4">
      <MapelManager />
    </div>
  )
}
