import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/withAuth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function canAccessPinjaman(
  id: string,
  user: { userId: string; role: "ADMIN" | "USER" }
) {
  if (user.role === "ADMIN") return true;
  const pinjam = await prisma.peminjaman.findUnique({
    where: { id },
    select: { archive: { select: { userId: true } } },
  });
  return pinjam?.archive.userId === user.userId;
}

// GET - Get peminjaman by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return error;

    // Await params to get the actual object
    const { id } = await params;

    if (!(await canAccessPinjaman(id, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id },
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
            tahun: true,
            lokasiSimpan: true,
            jenisNaskahDinas: true,
            kondisi: true,
          },
        },
      },
    });

    if (!peminjaman) {
      return NextResponse.json(
        {
          success: false,
          error: "Peminjaman not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: peminjaman,
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

// PUT - Update peminjaman by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return error;

    // Await params to get the actual object
    const { id } = await params;

    if (!(await canAccessPinjaman(id, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // Check if peminjaman exists
    const existingPeminjaman = await prisma.peminjaman.findUnique({
      where: { id },
    });

    if (!existingPeminjaman) {
      return NextResponse.json(
        {
          success: false,
          error: "Peminjaman not found",
        },
        { status: 404 }
      );
    }

    // If archiveId is being updated, check if new archive exists
    if (data.archiveId && data.archiveId !== existingPeminjaman.archiveId) {
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
    }

    // Check if nomorSurat is unique (if being updated)
    if (data.nomorSurat && data.nomorSurat !== existingPeminjaman.nomorSurat) {
      const existingNomorSurat = await prisma.peminjaman.findFirst({
        where: { nomorSurat: data.nomorSurat },
      });

      if (existingNomorSurat) {
        return NextResponse.json(
          {
            success: false,
            error: "Nomor surat peminjaman sudah digunakan",
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (data.archiveId) updateData.archiveId = data.archiveId;
    if (data.nomorSurat) updateData.nomorSurat = data.nomorSurat;
    if (data.peminjam) updateData.peminjam = data.peminjam;
    if (data.keperluan) updateData.keperluan = data.keperluan;
    if (data.tanggalPinjam)
      updateData.tanggalPinjam = new Date(data.tanggalPinjam);
    if (data.tanggalHarusKembali)
      updateData.tanggalHarusKembali = new Date(data.tanggalHarusKembali);
    if (data.tanggalPengembalian !== undefined) {
      updateData.tanggalPengembalian = data.tanggalPengembalian
        ? new Date(data.tanggalPengembalian)
        : null;
    }

    const updatedPeminjaman = await prisma.peminjaman.update({
      where: { id },
      data: updateData,
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

// DELETE - Delete peminjaman by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = requireAuth(request);
    if (error) return error;

    // Await params to get the actual object
    const { id } = await params;

    if (!(await canAccessPinjaman(id, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if peminjaman exists
    const existingPeminjaman = await prisma.peminjaman.findUnique({
      where: { id },
    });

    if (!existingPeminjaman) {
      return NextResponse.json(
        {
          success: false,
          error: "Peminjaman not found",
        },
        { status: 404 }
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
