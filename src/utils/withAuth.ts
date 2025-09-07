// utils/withAuth.ts - Fixed Version
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function requireAuth(req: NextRequest) {
  try {
    // Get token from cookies - use req.cookies instead of cookies()
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Verify JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return {
        user: null,
        error: NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        ),
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return {
      user: {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name,
      },
      error: null,
    };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}

// Alternative helper for cookie extraction
export function getAuthToken(req: NextRequest): string | null {
  // Method 1: req.cookies (recommended for API routes)
  const tokenFromReq = req.cookies.get("auth-token")?.value;
  if (tokenFromReq) return tokenFromReq;

  // Method 2: Manual header parsing (fallback)
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/auth-token=([^;]+)/);
    return match ? match[1] : null;
  }

  return null;
}
