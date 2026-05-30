import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const ipdRecordId = searchParams.get("ipdRecordId")

  const where: Record<string, unknown> = {}
  if (ipdRecordId) where.ipdRecordId = ipdRecordId

  const records = await prisma.nurseRecord.findMany({
    where,
    include: {
      ipdRecord: {
        select: {
          id: true,
          bedNumber: true,
          ward: true,
          patient: { select: { name: true, patientId: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(records)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { ipdRecordId, nurseName, observation, medication, diet, temperature, bloodPressure, pulseRate, notes } = body

  const record = await prisma.nurseRecord.create({
    data: {
      ipdRecordId,
      nurseName: nurseName || user.name,
      observation,
      medication,
      diet,
      temperature,
      bloodPressure,
      pulseRate,
      notes,
    },
    include: {
      ipdRecord: {
        select: {
          id: true,
          bedNumber: true,
          ward: true,
          patient: { select: { name: true, patientId: true } },
        },
      },
    },
  })

  return NextResponse.json(record, { status: 201 })
}
