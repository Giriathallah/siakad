import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXACT_PUBLIC_ROUTES = ["/", "/login", "/register"]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
            cookie: request.headers.get("cookie") || "",
        },
    })

    const session = res.ok ? await res.json().catch(() => null) : null

    // ✅ Sudah login & akses public route → redirect ke dashboard sesuai role
    if (session && EXACT_PUBLIC_ROUTES.includes(pathname)) {
        const role = session.user?.role
        if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
        if (role === "GURU") return NextResponse.redirect(new URL("/guru/dashboard", request.url))
        if (role === "SISWA") return NextResponse.redirect(new URL("/siswa/dashboard", request.url))
    }

    // ✅ Public route & belum login → lanjutkan
    if (EXACT_PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next()
    }

    // ✅ Belum login → redirect ke login
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    const role = session.user?.role

    // ✅ HAPUS pengecualian ADMIN — setiap role HANYA bisa akses dashboard-nya sendiri
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    if (pathname.startsWith("/guru") && role !== "GURU") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    if (pathname.startsWith("/siswa") && role !== "SISWA") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    // ✅ Redirect base path ke dashboard
    if (pathname === "/admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    if (pathname === "/guru") {
        return NextResponse.redirect(new URL("/guru/dashboard", request.url))
    }
    if (pathname === "/siswa") {
        return NextResponse.redirect(new URL("/siswa/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}