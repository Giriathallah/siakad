import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke portal SIAKAD (Sistem Informasi Akademik) untuk mengakses dasbor akademik Anda.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // PERBAIKAN: Menambahkan flex-1 dan w-full
    <div className="bg-surface-container-low min-h-screen flex-1 w-full flex items-center justify-center p-md">
      {children}
    </div>
  )
}