"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { GraduationCap, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"

export function LoginForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signIn.email({
                email: identifier,
                password: password,
            })

            if (result.error) {
                toast.error(result.error.message || "Email atau kata sandi salah")
                return
            }

            const { data } = await getSession()
            const role = (data?.user as any)?.role

            if (role === "ADMIN") router.push("/admin/dashboard")
            else if (role === "GURU") router.push("/guru/dashboard")
            else if (role === "SISWA") router.push("/siswa/dashboard")
            else router.push("/")

        } catch (error) {
            toast.error("Terjadi kesalahan saat masuk")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[448px] bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
            {/* PERBAIKAN: Mengganti md:max-w-md menjadi max-w-[448px] agar tidak bentrok dengan spacing md (16px) */}
            {/* Header Section */}
            <div className="text-center mb-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container text-on-primary-container mb-md">
                    <GraduationCap className="w-8 h-8" />
                </div>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-xs font-bold text-primary">
                    SIAKAD
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                    Masuk ke Sistem Informasi Akademik
                </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                {/* Email/NIS Field */}
                <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="identifier">
                        Email / NIS
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-outline" />
                        </div>
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Masukkan Email atau NIS"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between">
                        <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">
                            Kata Sandi
                        </label>
                        <a className="font-label-sm text-label-sm text-primary hover:text-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
                            Lupa Kata Sandi?
                        </a>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-outline" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Masukkan Kata Sandi"
                        />
                        <button
                            type="button"
                            aria-label="Toggle password visibility"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-sm">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Memproses..." : "Masuk"}
                        {!loading && (
                            <ArrowRight className="w-[18px] h-[18px]" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}