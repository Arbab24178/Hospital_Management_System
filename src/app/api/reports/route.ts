import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!type || !["appointments", "revenue", "patients", "doctors"].includes(type)) {
    return NextResponse.json({ error: "Invalid or missing type parameter" }, { status: 400 });
  }

  const fromDate = from ? new Date(from) : new Date(0);
  const toDate = to ? new Date(to) : new Date();

  switch (type) {
    case "appointments": {
      const grouped = await prisma.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { date: { gte: fromDate, lte: toDate } },
      });
      const data = grouped.map((g) => ({ status: g.status, count: g._count.id }));
      return NextResponse.json({ type: "appointments", from: fromDate, to: toDate, data });
    }

    case "revenue": {
      const invoices = await prisma.invoice.findMany({
        where: { createdAt: { gte: fromDate, lte: toDate } },
        select: { paidAmount: true, createdAt: true },
      });
      const map = new Map<string, number>();
      for (const inv of invoices) {
        const key = inv.createdAt.toISOString().slice(0, 10);
        map.set(key, (map.get(key) ?? 0) + (inv.paidAmount ?? 0));
      }
      const data = Array.from(map, ([date, total]) => ({ date, total }));
      return NextResponse.json({ type: "revenue", from: fromDate, to: toDate, data });
    }

    case "patients": {
      const grouped = await prisma.patient.groupBy({
        by: ["gender"],
        _count: { id: true },
      });
      const data = grouped.map((g) => ({ gender: g.gender, count: g._count.id }));
      return NextResponse.json({ type: "patients", data });
    }

    case "doctors": {
      const doctors = await prisma.doctor.findMany({
        include: {
          user: { select: { name: true } },
          _count: { select: { appointments: true } },
        },
      });
      const data = doctors.map((d) => ({
        id: d.id,
        name: d.user.name,
        specialization: d.specialization,
        appointmentCount: d._count.appointments,
      }));
      return NextResponse.json({ type: "doctors", data });
    }

    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
}
