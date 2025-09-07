import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken } from "@/utils/auth";
import { Prisma } from "@prisma/client";

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
  const role = payload.role;

  const now = new Date();

  // Filter kalau USER
  const baseWhere: Prisma.PeminjamanWhereInput =
    role === "ADMIN" ? {} : { archive: { userId } };

  const totalCount = await prisma.peminjaman.count({
    where: baseWhere,
  });

  const ongoingCount = await prisma.peminjaman.count({
    where: { ...baseWhere, tanggalPengembalian: null },
  });

  const returnedCount = await prisma.peminjaman.count({
    where: { ...baseWhere, NOT: { tanggalPengembalian: null } },
  });

  const overdueCount = await prisma.peminjaman.count({
    where: {
      ...baseWhere,
      tanggalPengembalian: null,
      tanggalHarusKembali: { lt: now },
    },
  });

  return NextResponse.json({
    totalCount,
    ongoingCount,
    returnedCount,
    overdueCount,
  });
}
