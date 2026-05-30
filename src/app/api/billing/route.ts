import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"
import { generateInvoiceNo } from "@/lib/utils"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      patient: { select: { name: true, phone: true, patientId: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { patientId, totalAmount, items, notes } = body

  const invoiceNo = await generateInvoiceNo()

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo,
      patientId,
      totalAmount,
      dueAmount: totalAmount,
      items: items || "[]",
      notes,
      createdById: user.userId,
    },
  })

  return NextResponse.json(invoice, { status: 201 })
}
