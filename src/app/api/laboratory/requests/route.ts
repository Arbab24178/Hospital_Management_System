import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const labRequests = await prisma.labRequest.findMany({
    where,
    include: {
      patient: { select: { name: true, patientId: true } },
      doctor: { include: { user: { select: { name: true } } } },
      test: { select: { name: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(labRequests)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { patientId, doctorId, testId, notes } = body

  const labRequest = await prisma.labRequest.create({
    data: { patientId, doctorId, testId, notes },
  })

  return NextResponse.json(labRequest, { status: 201 })
}
