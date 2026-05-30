import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, forbidden } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();
  const { id } = await params;

  const found = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
  });

  if (!found) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(found);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();
  const { id } = await params;

  const body = await request.json();
  const { name, email, role, phone, isActive, password } = body;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (role !== undefined) data.role = role;
  if (phone !== undefined) data.phone = phone;
  if (isActive !== undefined) data.isActive = isActive;
  if (password) data.password = await hashPassword(password);

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();
  const { id } = await params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({ where: { id }, data: { isActive: false } });

  return NextResponse.json({ message: "User deactivated" });
}
