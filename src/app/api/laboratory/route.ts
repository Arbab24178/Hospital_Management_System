import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")

  const where: Record<string, unknown> = { isActive: true }
  if (category) where.category = category

  const labTests = await prisma.labTest.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(labTests)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { name, category, price, normalRange, description } = body

  const labTest = await prisma.labTest.create({
    data: { name, category, price, normalRange, description },
  })

  return NextResponse.json(labTest, { status: 201 })
}
