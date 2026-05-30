import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  const where: any = { isActive: true }
  if (q) {
    where.OR = [
      { specialization: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ]
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(doctors)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await request.json()
  const { name, email, password, specialization, qualification, licenseNumber, fee, experience } = body

  const hashedPassword = await bcrypt.hash(password, 10)

  const doctor = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR",
      },
    })

    const newDoctor = await tx.doctor.create({
      data: {
        userId: newUser.id,
        specialization,
        qualification,
        licenseNumber,
        fee: fee ? parseFloat(fee) : 0,
        experience: experience ? parseInt(experience, 10) : 0,
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    })

    return newDoctor
  })

  return NextResponse.json(doctor, { status: 201 })
}
