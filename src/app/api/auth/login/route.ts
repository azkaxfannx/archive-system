import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie } from "@/utils/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: "Email tidak ditemukan" },
        { status: 404 }
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return NextResponse.json({ error: "Password salah" }, { status: 401 });

    const token = signToken({ userId: user.id, role: user.role as any });

    // FIXED: Use await for setAuthCookie
    await setAuthCookie(token);

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    return res;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
