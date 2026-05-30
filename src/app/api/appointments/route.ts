import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  const doctorId = searchParams.get("doctorId")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (date) {
    const start = new Date(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    where.date = { gte: start, lt: end }
  }
  if (doctorId) where.doctorId = doctorId
  if (status) where.status = status

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { name: true, phone: true, patientId: true } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { patientId, doctorId, date, timeSlot, type, reason } = body

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
  if (!doctor || !doctor.isActive) {
    return NextResponse.json({ error: "Doctor not found or inactive" }, { status: 400 })
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      date: new Date(date),
      timeSlot,
      type,
      reason,
    },
  })

  return NextResponse.json(appointment, { status: 201 })
}
