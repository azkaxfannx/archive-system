import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken } from "@/utils/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized - Please login first" },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid token - Please login again" },
      { status: 401 }
    );
  }

  const userId = payload.userId;
  const role = payload.role; // pastikan token menyimpan role juga

  // Kalau ADMIN → tidak ada filter ({}), kalau USER → filter berdasarkan userId
  const baseWhere = role === "ADMIN" ? {} : { userId };

  const totalCount = await prisma.archive.count({ where: baseWhere });
  const activeCount = await prisma.archive.count({
    where: { ...baseWhere, status: "ACTIVE" },
  });
  const inactiveCount = await prisma.archive.count({
    where: { ...baseWhere, status: "INACTIVE" },
  });
  const disposeCount = await prisma.archive.count({
    where: { ...baseWhere, status: "DISPOSE_ELIGIBLE" },
  });

  return NextResponse.json({
    totalCount,
    activeCount,
    inactiveCount,
    disposeCount,
  });
}
