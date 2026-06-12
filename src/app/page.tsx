import Link from "next/link"
import { Calculator, CheckCircle, ShieldCheck, LineChart, Database, History, ShieldAlert, Presentation, GraduationCap } from "lucide-react"
export default function HomePage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      {/* TopNavBar */}
      <nav className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant flex justify-between items-center px-margin h-20 max-w-screen-2xl mx-auto left-0 right-0">
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-primary font-bold leading-tight">SIAKAD</span>
          <span className="font-label-sm text-[10px] text-on-surface-variant tracking-wide uppercase">Sistem Informasi Akademik</span>
        </div>
        <div className="hidden md:flex items-center gap-lg">
          <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80" href="#features">
            Features
          </a>
          <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80" href="#automation">
            Automation
          </a>
          <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80" href="#data">
            Data Management
          </a>
          <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80" href="#roles">
            Role Access
          </a>
        </div>
        <div className="flex items-center gap-md">
          <Link href="/login" className="hidden md:block px-md py-sm bg-surface border border-outline-variant text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
            Login
          </Link>
          <Link href="/login" className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-[120px] pb-xl px-margin max-w-screen-2xl mx-auto w-full">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center py-xl mb-xl">
          <h1 className="font-headline-lg text-headline-lg md:text-[48px] md:leading-[56px] font-bold text-on-surface max-w-4xl mb-md">
            Sistem Pengolahan Nilai Siswa Terintegrasi
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-lg">
            Transformasi digital dalam pengelolaan akademik untuk akurasi dan efisiensi yang lebih baik.
          </p>
          <div className="flex gap-md">
            <Link href="/login" className="px-lg py-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors">
              Coba Sekarang
            </Link>
            <Link href="/login" className="px-lg py-md bg-surface border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
              Lihat Demo
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-xl mb-xl scroll-mt-24">
          <h2 className="font-headline-md text-headline-md text-center mb-xl text-on-surface">Fitur Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {/* Feature 1 */}
            <div id="automation" className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-sm transition-shadow scroll-mt-24">
              <Calculator className="text-primary w-8 h-8 mb-sm" />
              <h3 className="font-label-md text-label-md text-on-surface">Otomatisasi Nilai</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Penghitungan otomatis menggunakan rumus (30% Tugas, 30% UTS, 40% UAS).</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-sm transition-shadow">
              <CheckCircle className="text-secondary w-8 h-8 mb-sm" />
              <h3 className="font-label-md text-label-md text-on-surface">Status Kelulusan Instan</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Penentuan kelulusan otomatis berdasarkan standar KKM (&gt;= 70).</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-sm transition-shadow">
              <ShieldCheck className="text-primary w-8 h-8 mb-sm" />
              <h3 className="font-label-md text-label-md text-on-surface">Akses Berbasis Peran</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Portal khusus untuk Admin, Guru, dan Siswa (RBAC).</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-sm transition-shadow">
              <LineChart className="text-primary w-8 h-8 mb-sm" />
              <h3 className="font-label-md text-label-md text-on-surface">Laporan Akurat</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Laporan hasil belajar otomatis dan akurat per semester.</p>
            </div>
            {/* Feature 5 */}
            <div id="data" className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-sm transition-shadow scroll-mt-24">
              <Database className="text-primary w-8 h-8 mb-sm" />
              <h3 className="font-label-md text-label-md text-on-surface">Data Terpusat</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Pengelolaan data siswa, guru, dan mapel dalam satu platform.</p>
            </div>
            {/* Feature 6 */}
            <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-sm hover:shadow-sm transition-shadow">
              <History className="text-primary w-8 h-8 mb-sm" />
              <h3 className="font-label-md text-label-md text-on-surface">Arsip Histori</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Penyimpanan histori nilai per tahun ajaran yang aman.</p>
            </div>
          </div>
        </section>

        {/* Role Showcase */}
        <section id="roles" className="bg-surface-container-low rounded-xl p-xl mb-xl border border-outline-variant scroll-mt-24">
          <h2 className="font-headline-md text-headline-md text-center mb-xl text-on-surface">Akses Sesuai Kebutuhan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="flex flex-col items-center text-center gap-md">
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-sm">
                  <ShieldAlert className="text-on-primary-container w-8 h-8" />
              </div>
              <h4 className="font-label-md text-label-md text-on-surface text-lg">Admin</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Mengelola data master (siswa, guru, mapel) dan mengatur konfigurasi sistem akademik secara penuh.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-md">
              <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-sm">
                  <Presentation className="text-on-surface w-8 h-8" />
              </div>
              <h4 className="font-label-md text-label-md text-on-surface text-lg">Guru</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Menginput komponen nilai secara mudah dan melihat kalkulasi akhir secara instan sebelum dipublikasi.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-md">
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-sm">
                  <GraduationCap className="text-on-secondary-container w-8 h-8" />
              </div>
              <h4 className="font-label-md text-label-md text-on-surface text-lg">Siswa</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Memantau perkembangan nilai akademik dan mengunduh laporan hasil belajar setiap semester.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="flex flex-col items-center text-center py-xl bg-surface-container rounded-xl border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Siap Digitalisasi Akademik Anda?</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-lg">
            Tingkatkan efisiensi dan akurasi pengelolaan nilai dengan sistem kami.
          </p>
          <Link href="/login" className="px-xl py-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
            Mulai Sekarang
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container w-full py-xl border-t border-outline-variant flex flex-col md:flex-row justify-between items-center px-margin gap-lg">
        <div className="flex flex-col items-center md:items-start gap-sm">
          <div className="font-headline-sm text-headline-sm text-on-surface font-bold text-primary">
            SIAKAD
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left max-w-md">
            © 2026 SIAKAD (Sistem Informasi Akademik). Pengelolaan data akademik dan nilai siswa secara digital.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-md md:gap-lg font-body-md text-body-md text-on-surface-variant">
          <a className="hover:underline hover:text-primary transition-all text-on-surface-variant" href="#">Privacy Policy</a>
          <a className="hover:underline hover:text-primary transition-all text-on-surface-variant" href="#">Terms of Service</a>
          <a className="hover:underline hover:text-primary transition-all text-on-surface-variant" href="#">Documentation</a>
          <a className="hover:underline hover:text-primary transition-all text-on-surface-variant" href="#">Support</a>
        </div>
      </footer>
    </div>
  )
}
