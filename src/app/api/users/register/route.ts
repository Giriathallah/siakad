import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, created, err } from "@/lib/api-response"
import { registerSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
    const auth = await requireRole("ADMIN")
    if (!auth.ok) return auth.response

    const body = await validateBody(request, registerSchema)
    if (!body.ok) return body.response

    const { name, email, password, role } = body.data

    // Cek duplikasi
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return err("Email sudah terdaftar", 409)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            role,
            emailVerified: true,
            accounts: {
                create: {
                    accountId: email,
                    providerId: "credential",
                    password,
                },
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    })

    return created(user, "User berhasil didaftarkan")
}