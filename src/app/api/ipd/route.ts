import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const records = await prisma.iPDRecord.findMany({
    include: {
      patient: { select: { id: true, name: true, patientId: true } },
      doctor: { select: { id: true, user: { select: { name: true } } } },
      nurseRecords: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { admissionDate: "desc" },
  })

  return NextResponse.json(records)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { patientId, doctorId, ward, bedNumber, diagnosis, treatment, notes, expectedDischargeDate } = body

  const record = await prisma.iPDRecord.create({
    data: {
      patientId,
      doctorId,
      ward,
      bedNumber,
      diagnosis,
      treatment,
      notes,
      expectedDischargeDate: expectedDischargeDate ? new Date(expectedDischargeDate) : null,
    },
    include: {
      patient: { select: { id: true, name: true, patientId: true } },
      doctor: { select: { id: true, user: { select: { name: true } } } },
    },
  })

  return NextResponse.json(record, { status: 201 })
}
