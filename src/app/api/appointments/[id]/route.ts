import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: { id: true, patientId: true, name: true, email: true, phone: true, gender: true, bloodGroup: true, dob: true, address: true, emergencyContact: true, emergencyPhone: true },
      },
      doctor: {
        select: { id: true, specialization: true, qualification: true, licenseNumber: true, fee: true, experience: true, availableDays: true, availableTimeStart: true, availableTimeEnd: true, isActive: true, user: { select: { id: true, name: true, email: true, phone: true } } },
      },
    },
  })

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  return NextResponse.json(appointment)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const body = await req.json()
  const { status } = body

  const existing = await prisma.appointment.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(appointment)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const existing = await prisma.appointment.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  await prisma.appointment.delete({ where: { id } })

  return NextResponse.json({ message: "Appointment deleted" })
}
