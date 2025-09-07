import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/utils/auth";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logout successful" });

    // Clear the auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // This clears the cookie immediately
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}
