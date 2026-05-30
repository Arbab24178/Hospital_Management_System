import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const labRequest = await prisma.labRequest.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: true } },
      test: true,
      technician: { select: { name: true } },
    },
  })

  if (!labRequest) {
    return NextResponse.json({ error: "Lab request not found" }, { status: 404 })
  }

  return NextResponse.json(labRequest)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const existing = await prisma.labRequest.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Lab request not found" }, { status: 404 })
  }

  const body = await req.json()
  const { status, result, technicianId } = body

  const data: Record<string, unknown> = {}
  if (status) data.status = status
  if (result !== undefined) data.result = result
  if (technicianId) data.technicianId = technicianId
  if (status === "COMPLETED") data.completedAt = new Date()

  const labRequest = await prisma.labRequest.update({
    where: { id },
    data,
  })

  return NextResponse.json(labRequest)
}
