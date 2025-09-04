import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(process.env.AUTH_COOKIE_NAME || "token")?.value;
  const { pathname } = req.nextUrl;

  // Allow public routes:
  const publicPaths = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/me",
  ];
  if (publicPaths.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  // Protect pages (bukan API saja)
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
