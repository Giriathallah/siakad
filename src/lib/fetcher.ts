// src/lib/fetcher.ts
type FetchOptions = {
    method?: string
    body?: unknown
}

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

type ApiResult<T> = ApiSuccess<T> | ApiError

export async function apiFetch<T>(
    url: string,
    options: FetchOptions = {}
): Promise<ApiResult<T>> {
    try {
        const res = await fetch(url, {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        })

        const data = await res.json()

        if (!res.ok) {
            return {
                success: false,
                error: data.error || "Terjadi kesalahan",
                details: data.details,
            }
        }

        return {
            success: true,
            data: data.data,
            message: data.message,
        }
    } catch {
        return { success: false, error: "Gagal terhubung ke server" }
    }
}

export const api = {
    get: <T>(url: string) => apiFetch<T>(url),

    post: <T>(url: string, body?: unknown) =>
        apiFetch<T>(url, { method: "POST", body }),

    put: <T>(url: string, body?: unknown) =>
        apiFetch<T>(url, { method: "PUT", body }),

    patch: <T>(url: string, body?: unknown) =>
        apiFetch<T>(url, { method: "PATCH", body }),

    del: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
}