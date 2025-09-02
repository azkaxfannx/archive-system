import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  const totalCount = await prisma.peminjaman.count();

  const ongoingCount = await prisma.peminjaman.count({
    where: { tanggalPengembalian: null },
  });

  const returnedCount = await prisma.peminjaman.count({
    where: { NOT: { tanggalPengembalian: null } },
  });

  const overdueCount = await prisma.peminjaman.count({
    where: {
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
