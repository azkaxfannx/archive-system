import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Static import (recommended)
const AUTH_COOKIE_NAME = "token"; // atau dari utils

export function middleware(req: NextRequest) {
  // Debug environment availability
  console.log("Middleware Environment Debug:", {
    processEnvExists: typeof process !== "undefined",
    processEnvAuthCookie: process?.env?.AUTH_COOKIE_NAME,
    staticCookieName: AUTH_COOKIE_NAME,
    nodeEnv: process?.env?.NODE_ENV,
    runtime: "edge", // middleware selalu edge runtime
  });

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;

  // Allow public routes
  const publicPaths = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/me",
    "/_next",
    "/favicon.ico",
  ];

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect pages
  const protectedPages = ["/", "/archives", "/peminjaman"];
  if (protectedPages.some((p) => pathname.startsWith(p))) {
    if (!token) {
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
