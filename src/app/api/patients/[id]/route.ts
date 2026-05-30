import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: true,
      opdRecords: true,
      ipdRecords: true,
      invoices: true,
    },
  })

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  return NextResponse.json(patient)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const body = await request.json()

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      dob: body.dob ? new Date(body.dob) : undefined,
      age: body.age ? parseInt(body.age, 10) : undefined,
      gender: body.gender,
      bloodGroup: body.bloodGroup,
      address: body.address,
      emergencyContact: body.emergencyContact,
      emergencyPhone: body.emergencyPhone,
    },
  })

  return NextResponse.json(patient)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  await prisma.patient.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ message: "Patient deactivated" })
}
