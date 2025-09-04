import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/utils/auth";

export async function POST() {
  try {
    // FIXED: Use await for clearAuthCookie
    await clearAuthCookie();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}
