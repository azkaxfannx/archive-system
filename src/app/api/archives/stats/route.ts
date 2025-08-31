// pages/api/archives/stats.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const totalCount = await prisma.archive.count();
  const activeCount = await prisma.archive.count({
    where: { status: "ACTIVE" },
  });
  const inactiveCount = await prisma.archive.count({
    where: { status: "INACTIVE" },
  });
  const disposeCount = await prisma.archive.count({
    where: { status: "DISPOSE_ELIGIBLE" },
  });

  return NextResponse.json({
    totalCount,
    activeCount,
    inactiveCount,
    disposeCount,
  });
}
