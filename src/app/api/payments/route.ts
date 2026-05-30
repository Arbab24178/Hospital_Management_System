import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const payments = await prisma.payment.findMany({
    include: {
      invoice: {
        select: {
          invoiceNo: true,
          totalAmount: true,
          patient: { select: { name: true, patientId: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(payments)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { invoiceId, amount, mode, transactionId, notes } = body

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      mode,
      transactionId,
      notes,
      receivedBy: user.name,
    },
    include: {
      invoice: {
        select: {
          invoiceNo: true,
          totalAmount: true,
          paidAmount: true,
          patient: { select: { name: true, patientId: true } },
        },
      },
    },
  })

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { totalAmount: true, paidAmount: true },
  })

  if (invoice) {
    const newPaid = (invoice.paidAmount || 0) + amount
    const newStatus = newPaid >= invoice.totalAmount ? "PAID" : "PARTIAL"
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaid, dueAmount: invoice.totalAmount - newPaid, status: newStatus },
    })
  }

  return NextResponse.json(payment, { status: 201 })
}
