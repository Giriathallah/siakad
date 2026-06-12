import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen w-full flex-1 bg-background flex items-center justify-center p-margin">
            <div className="bg-surface border border-outline-variant rounded-lg p-lg w-full max-w-[448px] text-center flex flex-col items-center gap-md">
                <div className="w-[64px] h-[64px] bg-error-container rounded-full flex items-center justify-center mb-sm shrink-0">
                    <ShieldAlert className="text-on-error-container w-[32px] h-[32px]" />
                </div>

                <div className="flex flex-col gap-xs w-full">
                    <h1 className="font-headline-md text-headline-md text-on-surface m-0">
                        Akses Ditolak
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant m-0">
                        Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke dashboard Anda.
                    </p>
                </div>

                <Link
                    href="/"
                    className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded hover:bg-primary-container transition-colors w-full mt-sm block"
                >
                    Kembali ke Beranda
                </Link>
                <Link
                    href="/login"
                    className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded hover:bg-primary-container transition-colors w-full mt-sm block"
                >
                    Login
                </Link>
            </div>
        </div>
    )
}