// src/lib/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "@/lib/prisma"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        autoSignIn: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "SISWA",
                input: false,
            },
            isActive: {
                type: "boolean",
                defaultValue: true,
                input: false,
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 hari
        updateAge: 60 * 60 * 24,
    },
})

export type Session = typeof auth.$Infer.Session