import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"
import bcrypt from "bcryptjs"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true, phone: true, isActive: true },
      },
    },
  })

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
  }

  return NextResponse.json(doctor)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const body = await request.json()

  const doctor = await prisma.$transaction(async (tx) => {
    const existing = await tx.doctor.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!existing) throw new Error("Doctor not found")

    await tx.user.update({
      where: { id: existing.userId },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        ...(body.password
          ? { password: await bcrypt.hash(body.password, 10) }
          : {}),
      },
    })

    return tx.doctor.update({
      where: { id },
      data: {
        specialization: body.specialization,
        qualification: body.qualification,
        licenseNumber: body.licenseNumber,
        fee: body.fee ? parseFloat(body.fee) : undefined,
        experience: body.experience ? parseInt(body.experience, 10) : undefined,
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    })
  })

  return NextResponse.json(doctor)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  await prisma.$transaction(async (tx) => {
    const doctor = await tx.doctor.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!doctor) return

    await tx.doctor.update({
      where: { id },
      data: { isActive: false },
    })

    await tx.user.update({
      where: { id: doctor.userId },
      data: { isActive: false },
    })
  })

  return NextResponse.json({ message: "Doctor deactivated" })
}
