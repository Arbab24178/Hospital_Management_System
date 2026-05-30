import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, forbidden } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const body = await request.json();
  const { name, email, password, role, phone } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const hashed = await hashPassword(password);

  const created = await prisma.user.create({
    data: { name, email, password: hashed, role, phone },
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(created, { status: 201 });
}
