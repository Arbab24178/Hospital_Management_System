import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-utils";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingBills,
    monthlyRevenueResult,
    pendingLabTests,
    lowStockItems,
  ] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count({
      where: { date: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.invoice.count({
      where: { status: { in: ["PENDING", "PARTIAL"] } },
    }),
    prisma.invoice.aggregate({
      _sum: { paidAmount: true },
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.labRequest.count({ where: { status: "PENDING" } }),
    prisma.inventoryItem.findMany().then(
      (items) => items.filter((i) => i.quantity <= i.reorderLevel).length
    ),
  ]);

  return NextResponse.json({
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingBills,
    monthlyRevenue: monthlyRevenueResult._sum.paidAmount ?? 0,
    pendingLabTests,
    lowStockItems,
  });
}
