import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const latest = await prisma.archive.findFirst({
      orderBy: { entryDate: "desc" },
      select: { entryDate: true },
    });

    return NextResponse.json({
      lastEntryDate: latest?.entryDate
        ? new Date(latest.entryDate).toISOString() // format ISO lengkap
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data terbaru" },
      { status: 500 }
    );
  }
}
