import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ZodError, ZodSchema } from "zod"

// ═══════════════════════════════════════════
// TIPE RESPONSE STANDAR
// ═══════════════════════════════════════════

type ApiSuccess<T> = {
    success: true
    data: T
    message?: string
}

type ApiError = {
    success: false
    error: string
    details?: Record<string, string[]>
}

type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ═══════════════════════════════════════════
// HELPER RESPONSE
// ═══════════════════════════════════════════

export function ok<T>(data: T, status = 200, message?: string): NextResponse {
    const body: ApiSuccess<T> = { success: true, data }
    if (message) body.message = message
    return NextResponse.json(body, { status })
}

export function created<T>(data: T, message?: string): NextResponse {
    return ok(data, 201, message)
}

export function err(
    message: string,
    status = 400,
    details?: Record<string, string[]>
): NextResponse {
    const body: ApiError = { success: false, error: message }
    if (details) body.details = details
    return NextResponse.json(body, { status })
}

export function notFound(message = "Data tidak ditemukan"): NextResponse {
    return err(message, 404)
}

export function unauthorized(message = "Tidak terautentikasi"): NextResponse {
    return err(message, 401)
}

export function forbidden(message = "Akses ditolak"): NextResponse {
    return err(message, 403)
}

export function validationError(zodError: ZodError): NextResponse {
    const fieldErrors = zodError.flatten().fieldErrors
    // Konversi ke Record<string, string[]>
    const details: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(fieldErrors)) {
        if (value) details[key] = value as string[]
    }
    // Ambil pesan error pertama sebagai pesan utama
    const firstError = zodError.issues[0]?.message || "Data tidak valid"
    return err(firstError, 422, details)
}

// ═══════════════════════════════════════════
// SESSION & AUTH GUARD
// ═══════════════════════════════════════════

type Role = "ADMIN" | "GURU" | "SISWA"

type SessionResult = {
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
    role: Role
}

type AuthCheckResult =
    | { ok: true; session: SessionResult["session"]; role: SessionResult["role"] }
    | { ok: false; response: NextResponse }

async function getSessionAndRole(): Promise<SessionResult | null> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return null
    const role = (session.user as any).role as Role
    return { session, role }
}

/**
 * Cek apakah user sudah login.
 * Return object dengan discriminated union untuk type safety.
 */
export async function requireAuth(): Promise<AuthCheckResult> {
    const result = await getSessionAndRole()
    if (!result) return { ok: false, response: unauthorized() }
    return { ok: true, session: result.session, role: result.role }
}

/**
 * Cek apakah user sudah login DAN memiliki role yang diizinkan.
 */
export async function requireRole(...roles: Role[]): Promise<AuthCheckResult> {
    const result = await getSessionAndRole()
    if (!result) return { ok: false, response: unauthorized() }
    if (!roles.includes(result.role)) return { ok: false, response: forbidden() }
    return { ok: true, session: result.session, role: result.role }
}

// ═══════════════════════════════════════════
// PARSE & VALIDATE BODY
// ═══════════════════════════════════════════

/**
 * Parse JSON body + validasi dengan Zod schema.
 * Return data yang sudah tervalidasi atau error response.
 */
export async function validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<
    { ok: true; data: T } | { ok: false; response: NextResponse }
> {
    try {
        const raw = await request.json()
        const data = schema.parse(raw)
        return { ok: true, data }
    } catch (error) {
        if (error instanceof ZodError) {
            return { ok: false, response: validationError(error) }
        }
        return { ok: false, response: err("Body request tidak valid", 400) }
    }
}

// ═══════════════════════════════════════════
// SEARCH PARAMS HELPER
// ═══════════════════════════════════════════

export function getSearchParams(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    return searchParams
}

/**
 * Ambil search params dengan default value.
 */
export function getParam(
    request: NextRequest,
    key: string,
    defaultValue?: string
): string | undefined {
    const { searchParams } = new URL(request.url)
    return searchParams.get(key) ?? defaultValue ?? undefined
}