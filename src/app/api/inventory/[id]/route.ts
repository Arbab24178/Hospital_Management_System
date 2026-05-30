import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { medicine: true },
  })

  if (!item) {
    return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
  }

  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const existing = await prisma.inventoryItem.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
  }

  const body = await req.json()
  const { itemName, category, quantity, unitPrice, supplier, reorderLevel, medicineId, description } = body

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: { itemName, category, quantity, unitPrice, supplier, reorderLevel, medicineId, description },
  })

  return NextResponse.json(item)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const existing = await prisma.inventoryItem.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
  }

  await prisma.inventoryItem.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ message: "Inventory item deleted" })
}
