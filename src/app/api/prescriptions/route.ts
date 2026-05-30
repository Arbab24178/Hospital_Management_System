import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/api-utils"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const prescriptions = await prisma.prescription.findMany({
    include: {
      patient: { select: { id: true, name: true, patientId: true } },
      doctor: { select: { id: true, user: { select: { name: true } } } },
      items: { include: { medicine: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(prescriptions)
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return unauthorized()

  const body = await req.json()
  const { patientId, doctorId, diagnosis, notes, items } = body

  const prescription = await prisma.prescription.create({
    data: {
      patientId,
      doctorId,
      diagnosis,
      notes,
      items: {
        create: items.map((item: any) => ({
          medicineId: item.medicineId,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          quantity: item.quantity || 1,
        })),
      },
    },
    include: {
      patient: { select: { id: true, name: true, patientId: true } },
      doctor: { select: { id: true, user: { select: { name: true } } } },
      items: { include: { medicine: { select: { name: true } } } },
    },
  })

  return NextResponse.json(prescription, { status: 201 })
}
