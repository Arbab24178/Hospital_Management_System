import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: true,
      payments: true,
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  return NextResponse.json(invoice)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const body = await req.json()
  const { status, paidAmount, dueAmount } = body

  const existing = await prisma.invoice.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(paidAmount !== undefined && { paidAmount }),
      ...(dueAmount !== undefined && { dueAmount }),
    },
  })

  return NextResponse.json(invoice)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) return unauthorized()
  const { id } = await params

  const existing = await prisma.invoice.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  await prisma.invoice.delete({ where: { id } })

  return NextResponse.json({ message: "Invoice deleted" })
}
