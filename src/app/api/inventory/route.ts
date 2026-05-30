import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const lowStock = searchParams.get("lowStock")

  const where: Record<string, unknown> = { isActive: true }
  if (category) where.category = category

  let items = await prisma.inventoryItem.findMany({
    where,
    include: { medicine: { select: { name: true } } },
    orderBy: { itemName: "asc" },
  })

  if (lowStock === "true") {
    items = items.filter((item) => item.quantity <= item.reorderLevel)
  }

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { itemName, category, quantity, unitPrice, supplier, reorderLevel, medicineId, description } = body

  const item = await prisma.inventoryItem.create({
    data: { itemName, category, quantity, unitPrice, supplier, reorderLevel, medicineId, description },
  })

  return NextResponse.json(item, { status: 201 })
}
