import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole, validateBody, ok, err, notFound } from "@/lib/api-response"
import { updateSiswaSchema } from "@/lib/validations"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireRole("ADMIN", "GURU")
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const siswa = await prisma.siswa.findUnique({
    where: { id },
    include: {
      kelas: true,
      user: { select: { email: true, isActive: true } },
    },
  })

  if (!siswa || siswa.deletedAt) return notFound("Siswa tidak ditemukan")
  return ok(siswa)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireRole("ADMIN")
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const body = await validateBody(request, updateSiswaSchema)
  if (!body.ok) return body.response

  const siswa = await prisma.siswa.findUnique({ where: { id } })
  if (!siswa) return notFound("Siswa tidak ditemukan")

  if (body.data.nis && body.data.nis !== siswa.nis) {
    const dup = await prisma.siswa.findUnique({ where: { nis: body.data.nis } })
    if (dup) return err("NIS sudah digunakan", 409)
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (body.data.isActive !== undefined) {
      await tx.user.update({
        where: { id: siswa.userId },
        data: { isActive: body.data.isActive },
      })
    }

    return tx.siswa.update({
      where: { id },
      data: {
        ...(body.data.nis && { nis: body.data.nis }),
        ...(body.data.namaLengkap && { namaLengkap: body.data.namaLengkap }),
        ...(body.data.nisn !== undefined && { nisn: body.data.nisn }),
        ...(body.data.kelasId !== undefined && { kelasId: body.data.kelasId }),
        ...(body.data.isActive !== undefined && { 
            deletedAt: body.data.isActive ? null : new Date() 
        }),
      },
      include: {
        kelas: { select: { id: true, namaKelas: true, tingkat: true } },
        user: { select: { email: true, isActive: true } },
      },
    })
  })

  return ok(updated, 200, "Data siswa berhasil diperbarui")
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireRole("ADMIN")
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const siswa = await prisma.siswa.findUnique({ where: { id } })
  if (!siswa || siswa.deletedAt) return notFound("Siswa tidak ditemukan")

  await prisma.$transaction([
    prisma.siswa.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: siswa.userId },
      data: { isActive: false },
    }),
  ])

  return ok(null, 200, "Siswa berhasil dinonaktifkan")
}