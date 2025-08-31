import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Export all archives
export async function GET(req: NextRequest) {
  try {
    const archives = await prisma.archive.findMany({
      orderBy: { entryDate: "desc" },
    });

    return NextResponse.json(archives);
  } catch (error: any) {
    console.error("Export Archives error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export archives" },
      { status: 500 }
    );
  }
}
