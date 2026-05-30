import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const medicine = await prisma.medicine.findUnique({
    where: { id },
  })

  if (!medicine) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
  }

  return NextResponse.json(medicine)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const existing = await prisma.medicine.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
  }

  const body = await req.json()
  const { name, category, manufacturer, price, stock, expiryDate, description } = body

  const medicine = await prisma.medicine.update({
    where: { id },
    data: {
      name,
      category,
      manufacturer,
      price,
      stock,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      description,
    },
  })

  return NextResponse.json(medicine)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const existing = await prisma.medicine.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
  }

  await prisma.medicine.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ message: "Medicine deleted" })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const body = await req.json()
  const { stock } = body

  const existing = await prisma.medicine.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
  }

  const medicine = await prisma.medicine.update({
    where: { id },
    data: { stock },
  })

  return NextResponse.json(medicine)
}
