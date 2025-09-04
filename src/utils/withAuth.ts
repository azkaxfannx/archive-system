// utils/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  role: "ADMIN" | "USER";
}

type RequireAuthResult =
  | { user: AuthUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

export function requireAuth(req: NextRequest): RequireAuthResult {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return { user: decoded };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}
