import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const records = await prisma.oPDRecord.findMany({
    include: {
      patient: { select: { id: true, name: true, patientId: true } },
      doctor: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(records)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { patientId, doctorId, complaint, diagnosis, vitals, fee, followUpDate, notes } = body

  const record = await prisma.oPDRecord.create({
    data: {
      patientId,
      doctorId,
      complaint,
      diagnosis,
      vitals,
      fee: fee || 0,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes,
    },
    include: {
      patient: { select: { id: true, name: true, patientId: true } },
      doctor: { select: { id: true, user: { select: { name: true } } } },
    },
  })

  return NextResponse.json(record, { status: 201 })
}
