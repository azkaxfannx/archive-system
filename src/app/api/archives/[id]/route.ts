import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/utils/withAuth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function canAccessArchive(
  id: string,
  user?: { userId: string; role: "ADMIN" | "USER" }
) {
  if (!user) return false; // kalau gak ada user, pasti gak boleh
  if (user.role === "ADMIN") return true;

  const arch = await prisma.archive.findUnique({
    where: { id },
    select: { userId: true },
  });

  return arch?.userId === user.userId;
}

// GET - Get single archive
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const { id } = await params; // Await the params Promise

    if (!(await canAccessArchive(id, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const archive = await prisma.archive.findUnique({
      where: { id },
    });

    if (!archive) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    return NextResponse.json(archive);
  } catch (error: any) {
    console.error("GET Archive error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch archive" },
      { status: 500 }
    );
  }
}

// PUT - Update archive
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const { id } = await params; // Await the params Promise

    if (!(await canAccessArchive(id, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    const archive = await prisma.archive.update({
      where: { id },
      data: {
        kodeUnit: data.kodeUnit || undefined,
        indeks: data.indeks || undefined,
        nomorBerkas: data.nomorBerkas || undefined,
        judulBerkas: data.judulBerkas || undefined,
        nomorIsiBerkas: data.nomorIsiBerkas || undefined,
        jenisNaskahDinas: data.jenisNaskahDinas || undefined,
        klasifikasi: data.klasifikasi || undefined,
        nomorSurat: data.nomorSurat || undefined,
        tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
        perihal: data.perihal || undefined,
        tahun:
          data.tahun ||
          (data.tanggal ? new Date(data.tanggal).getFullYear() : undefined),
        tingkatPerkembangan: data.tingkatPerkembangan || undefined,
        kondisi: data.kondisi || undefined,
        lokasiSimpan: data.lokasiSimpan || undefined,
        retensiAktif: data.retensiAktif || undefined,
        keterangan: data.keterangan || undefined,
        entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
        retentionYears: data.retentionYears || undefined,
        status: data.status || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(archive);
  } catch (error: any) {
    console.error("PUT Archive error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update archive" },
      { status: 500 }
    );
  }
}

// DELETE - Delete archive
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const { id } = await params; // Await the params Promise

    if (!(await canAccessArchive(id, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.archive.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Archive error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete archive" },
      { status: 500 }
    );
  }
}
