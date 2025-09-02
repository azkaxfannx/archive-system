import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all peminjaman or by archiveId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archiveId = searchParams.get("archiveId");
    const peminjam = searchParams.get("peminjam");

    // Build where condition
    const where: any = {};
    if (archiveId) where.archiveId = archiveId;
    if (peminjam) {
      where.peminjam = {
        contains: peminjam,
        mode: "insensitive",
      };
    }

    const peminjaman = await prisma.peminjaman.findMany({
      where,
      include: {
        archive: {
          select: {
            id: true,
            judulBerkas: true,
            nomorBerkas: true,
            klasifikasi: true,
            nomorSurat: true,
            perihal: true,
            tanggal: true,
            lokasiSimpan: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: peminjaman,
      total: peminjaman.length,
    });
  } catch (error) {
    console.error("Error fetching peminjaman:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch peminjaman",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new peminjaman
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "archiveId",
      "nomorSurat",
      "peminjam",
      "keperluan",
      "tanggalPinjam",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Field ${field} is required`,
          },
          { status: 400 }
        );
      }
    }

    // Check if archive exists
    const archive = await prisma.archive.findUnique({
      where: { id: data.archiveId },
    });

    if (!archive) {
      return NextResponse.json(
        {
          success: false,
          error: "Archive not found",
        },
        { status: 404 }
      );
    }

    // Check if nomorSurat is unique
    const existingPeminjaman = await prisma.peminjaman.findUnique({
      where: { nomorSurat: data.nomorSurat },
    });

    if (existingPeminjaman) {
      return NextResponse.json(
        {
          success: false,
          error: "Nomor surat peminjaman sudah digunakan",
        },
        { status: 400 }
      );
    }

    // Auto-calculate tanggalHarusKembali if not provided
    if (!data.tanggalHarusKembali && data.tanggalPinjam) {
      const pinjamDate = new Date(data.tanggalPinjam);
      const kembaliDate = new Date(pinjamDate);
      kembaliDate.setDate(pinjamDate.getDate() + 7); // Default 7 days
      data.tanggalHarusKembali = kembaliDate.toISOString();
    }

    const peminjaman = await prisma.peminjaman.create({
      data: {
        archiveId: data.archiveId,
        nomorSurat: data.nomorSurat,
        peminjam: data.peminjam,
        keperluan: data.keperluan,
        tanggalPinjam: new Date(data.tanggalPinjam),
        tanggalHarusKembali: new Date(data.tanggalHarusKembali),
        tanggalPengembalian: data.tanggalPengembalian
          ? new Date(data.tanggalPengembalian)
          : null,
      },
      include: {
        archive: {
          select: {
            id: true,
            judulBerkas: true,
            nomorBerkas: true,
            klasifikasi: true,
            nomorSurat: true,
            perihal: true,
            tanggal: true,
            lokasiSimpan: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: peminjaman,
        message: "Peminjaman created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating peminjaman:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create peminjaman",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
