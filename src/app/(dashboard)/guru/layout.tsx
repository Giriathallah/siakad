"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import {
  LayoutDashboard,
  FileEdit,
  FileText,
  LogOut,
  Settings,
  GraduationCap
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/guru/dashboard", icon: LayoutDashboard },
  { name: "Input Nilai", href: "/guru/input-nilai", icon: FileEdit },
  { name: "Rekap Nilai", href: "/guru/rekap-nilai", icon: FileText },
]

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Sidebar memiliki lebar tetap 260px sesuai variabel sidebar-width */}
      <nav className="w-[260px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface hidden md:flex flex-col z-20">

        {/* Brand / Header Profile */}
        <div className="p-lg flex flex-col items-center justify-center border-b border-outline-variant gap-sm">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary">
            <GraduationCap size={32} />
          </div>
          <div className="text-center">
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary tracking-wide">SIAKAD</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full inline-block mt-1">
              Portal Guru
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-md flex flex-col gap-sm px-sm">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md px-md py-sm rounded-lg font-body-md text-body-md transition-colors duration-200 ${isActive
                    ? "text-on-primary bg-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-md border-t border-outline-variant flex flex-col gap-sm">
          <div className="flex flex-col gap-xs">
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-md px-md py-sm rounded-lg text-error hover:bg-error hover:text-white transition-all duration-200 font-label-md text-label-md w-full text-left"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {/* Margin kiri 260px untuk memberi ruang bagi fixed sidebar */}
      <main className="flex-1 ml-0 md:ml-[260px] min-h-screen bg-background flex flex-col">
        <div className="p-md md:p-margin flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </>
  )
}
