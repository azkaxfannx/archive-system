import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    console.log("Me route - Token found:", !!token); // Debug log

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log("Me route - Token verification failed"); // Debug log
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      console.log("Me route - User not found"); // Debug log
      return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log("Me route - Success, user:", user.email); // Debug log
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Me route error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
