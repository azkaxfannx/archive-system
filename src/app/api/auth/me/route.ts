import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // FIXED: Use await for cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return NextResponse.json({ user: null }, { status: 200 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ user: null }, { status: 200 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Me route error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
