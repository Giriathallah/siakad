import SiswaManager from "@/components/features/admin/siswaManager"

export const metadata = {
  title: "Manajemen Data Siswa",
  description: "Kelola data registrasi siswa, Nomor Induk Siswa (NIS), dan informasi kelas di SIAKAD.",
}

export default function SiswaPage() {
  return <SiswaManager />
}