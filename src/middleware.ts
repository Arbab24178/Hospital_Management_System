import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

const publicPaths = ["/login"]

const rolePaths: Record<string, string> = {
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  NURSE: "/nurse",
  RECEPTIONIST: "/receptionist",
  PHARMACIST: "/pharmacist",
  ACCOUNTANT: "/accountant",
  LAB_TECHNICIAN: "/lab-technician",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const user = await verifyToken(token)
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("token")
    return response
  }

  if (pathname === "/" || pathname === "") {
    const defaultPath = rolePaths[user.role] || "/admin"
    return NextResponse.redirect(new URL(defaultPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
