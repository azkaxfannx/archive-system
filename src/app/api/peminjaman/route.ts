import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/withAuth";

// GET - Get all peminjaman or by archiveId
export async function GET(request: NextRequest) {
  try {
    console.log("=== PEMINJAMAN API DEBUG ===");
    console.log("Headers:", Object.fromEntries(request.headers.entries()));
    console.log("Cookies:", Object.fromEntries(request.cookies));

    const authToken = request.cookies.get("auth-token")?.value;
    console.log("Auth token found:", authToken ? "YES" : "NO");

    const { user, error } = requireAuth(request);
    console.log("Auth result:", { user: !!user, error: !!error });

    if (error) {
      console.log("Auth failed, returning error");
      return error;
    }

    console.log("Auth successful, user:", user);

    const { searchParams } = new URL(request.url);
    const archiveId = searchParams.get("archiveId");
    const peminjam = searchParams.get("peminjam");

    // Build where condition
    const where: any =
      user.role === "ADMIN" ? {} : { archive: { userId: user.userId } };
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
    console.log("=== CREATE PEMINJAMAN DEBUG ===");
    console.log("Headers:", Object.fromEntries(request.headers.entries()));
    console.log("Cookies:", Object.fromEntries(request.cookies));

    const authToken = request.cookies.get("auth-token")?.value;
    console.log("Auth token found:", authToken ? "YES" : "NO");

    const { user, error } = requireAuth(request);
    console.log("Auth result:", { user: !!user, error: !!error });

    if (error) {
      console.log("Auth failed, returning error");
      return error;
    }

    console.log("Auth successful, user:", user);

    const data = await request.json();
    console.log("Request data:", data);

    // Check user permissions for non-admin users
    if (user.role !== "ADMIN") {
      const archive = await prisma.archive.findFirst({
        where: { id: data.archiveId, userId: user.userId },
        select: { id: true },
      });
      if (!archive) {
        return NextResponse.json(
          { error: "Tidak boleh meminjam arsip yang bukan milikmu" },
          { status: 403 }
        );
      }
    }

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

    // Check if nomorSurat is already being used for ACTIVE peminjaman (belum dikembalikan)
    const activePeminjaman = await prisma.peminjaman.findFirst({
      where: {
        nomorSurat: data.nomorSurat,
        tanggalPengembalian: null, // Belum dikembalikan
      },
    });

    if (activePeminjaman) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nomor surat peminjaman masih digunakan untuk peminjaman yang belum dikembalikan",
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

// PUT - Update peminjaman (untuk pengembalian)
export async function PUT(request: NextRequest) {
  try {
    console.log("=== UPDATE PEMINJAMAN DEBUG ===");
    const authToken = request.cookies.get("auth-token")?.value;
    console.log("Auth token found:", authToken ? "YES" : "NO");

    const { user, error } = requireAuth(request);
    if (error) return error;

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Peminjaman ID is required" },
        { status: 400 }
      );
    }

    // Check if peminjaman exists and user has permission
    const existingPeminjaman = await prisma.peminjaman.findUnique({
      where: { id },
      include: { archive: { select: { userId: true } } },
    });

    if (!existingPeminjaman) {
      return NextResponse.json(
        { success: false, error: "Peminjaman not found" },
        { status: 404 }
      );
    }

    // Check permissions for non-admin users
    if (
      user.role !== "ADMIN" &&
      existingPeminjaman.archive.userId !== user.userId
    ) {
      return NextResponse.json(
        { error: "Tidak diizinkan mengupdate peminjaman ini" },
        { status: 403 }
      );
    }

    const updatedPeminjaman = await prisma.peminjaman.update({
      where: { id },
      data: {
        ...updateData,
        tanggalPinjam: updateData.tanggalPinjam
          ? new Date(updateData.tanggalPinjam)
          : undefined,
        tanggalHarusKembali: updateData.tanggalHarusKembali
          ? new Date(updateData.tanggalHarusKembali)
          : undefined,
        tanggalPengembalian: updateData.tanggalPengembalian
          ? new Date(updateData.tanggalPengembalian)
          : undefined,
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

    return NextResponse.json({
      success: true,
      data: updatedPeminjaman,
      message: "Peminjaman updated successfully",
    });
  } catch (error) {
    console.error("Error updating peminjaman:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update peminjaman",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete peminjaman
export async function DELETE(request: NextRequest) {
  try {
    console.log("=== DELETE PEMINJAMAN DEBUG ===");
    const authToken = request.cookies.get("auth-token")?.value;
    console.log("Auth token found:", authToken ? "YES" : "NO");

    const { user, error } = requireAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Peminjaman ID is required" },
        { status: 400 }
      );
    }

    // Check if peminjaman exists and user has permission
    const existingPeminjaman = await prisma.peminjaman.findUnique({
      where: { id },
      include: { archive: { select: { userId: true } } },
    });

    if (!existingPeminjaman) {
      return NextResponse.json(
        { success: false, error: "Peminjaman not found" },
        { status: 404 }
      );
    }

    // Check permissions for non-admin users
    if (
      user.role !== "ADMIN" &&
      existingPeminjaman.archive.userId !== user.userId
    ) {
      return NextResponse.json(
        { error: "Tidak diizinkan menghapus peminjaman ini" },
        { status: 403 }
      );
    }

    await prisma.peminjaman.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Peminjaman deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting peminjaman:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete peminjaman",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
