import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"
import { generatePatientId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  const where: any = { isActive: true }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { patientId: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ]
  }

  const patients = await prisma.patient.findMany({
    where,
    select: {
      id: true,
      patientId: true,
      name: true,
      phone: true,
      gender: true,
      bloodGroup: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(patients)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await request.json()
  const patientId = generatePatientId()

  const patient = await prisma.patient.create({
    data: {
      patientId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      dob: body.dob ? new Date(body.dob) : null,
      age: body.age ? parseInt(body.age, 10) : null,
      gender: body.gender,
      bloodGroup: body.bloodGroup,
      address: body.address,
      emergencyContact: body.emergencyContact,
      emergencyPhone: body.emergencyPhone,
    },
  })

  return NextResponse.json(patient, { status: 201 })
}
