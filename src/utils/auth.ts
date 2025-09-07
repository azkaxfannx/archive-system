import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "auth-token";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface TokenPayload {
  userId: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Simplified utility functions - cookies are handled in route handlers
export { AUTH_COOKIE_NAME as default };
