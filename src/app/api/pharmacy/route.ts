import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  const where: Record<string, unknown> = { isActive: true }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ]
  }

  const medicines = await prisma.medicine.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(medicines)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { name, category, manufacturer, price, stock, expiryDate, description } = body

  const medicine = await prisma.medicine.create({
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

  return NextResponse.json(medicine, { status: 201 })
}
