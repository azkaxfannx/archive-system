import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET - Fetch archives with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "entryDate";
    const order = searchParams.get("order") || "desc";

    const where: Prisma.ArchiveWhereInput = {};

    if (search) {
      where.OR = [
        { kodeUnit: { contains: search, mode: "insensitive" } },
        { nomorSurat: { contains: search, mode: "insensitive" } },
        { perihal: { contains: search, mode: "insensitive" } },
        { nomorBerkas: { contains: search, mode: "insensitive" } },
        { lokasiSimpan: { contains: search, mode: "insensitive" } },
        { judulBerkas: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    searchParams.forEach((value, key) => {
      if (key.startsWith("filter[") && value) {
        const column = key.slice(7, -1);
        switch (column) {
          case "nomorSurat":
            where.nomorSurat = { contains: value, mode: "insensitive" };
            break;
          case "judulBerkas":
            where.judulBerkas = { contains: value, mode: "insensitive" };
            break;
          case "lokasiSimpan":
            where.lokasiSimpan = { contains: value, mode: "insensitive" };
            break;
          case "jenisNaskahDinas":
            where.jenisNaskahDinas = { contains: value, mode: "insensitive" };
            break;
          case "kodeUnit":
            where.kodeUnit = { contains: value, mode: "insensitive" };
            break;
        }
      }
    });

    const orderBy: Prisma.ArchiveOrderByWithRelationInput = {};
    switch (sort) {
      case "entryDate":
        orderBy.entryDate = order as "asc" | "desc";
        break;
      case "nomorSurat":
        orderBy.nomorSurat = order as "asc" | "desc";
        break;
      case "nomorBerkas":
        orderBy.nomorBerkas = order as "asc" | "desc";
        break;
      case "lokasiSimpan":
        orderBy.lokasiSimpan = order as "asc" | "desc";
        break;
      case "status":
        orderBy.status = order as "asc" | "desc";
        break;
      default:
        // Fallback ke entryDate desc jika sort field tidak dikenali
        orderBy.entryDate = "desc";
    }

    const skip = (page - 1) * limit;

    const [archives, total] = await Promise.all([
      prisma.archive.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.archive.count({ where }),
    ]);

    return NextResponse.json({
      data: archives,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET Archives error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch archives" },
      { status: 500 }
    );
  }
}

// POST - Create new archive
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const archive = await prisma.archive.create({
      data: {
        kodeUnit: data.kodeUnit || null,
        indeks: data.indeks || null,
        nomorBerkas: data.nomorBerkas || null,
        nomorIsiBerkas: data.nomorIsiBerkas || null,
        judulBerkas: data.judulBerkas || null,
        jenisNaskahDinas: data.jenisNaskahDinas || null,
        klasifikasi: data.klasifikasi || null,
        nomorSurat: data.nomorSurat || null,
        perihal: data.perihal || null,
        tanggal: data.tanggal ? new Date(data.tanggal) : null,
        tahun: data.tahun || null,
        tingkatPerkembangan: data.tingkatPerkembangan || null,
        kondisi: data.kondisi || null,
        lokasiSimpan: data.lokasiSimpan || null,
        retensiAktif: data.retensiAktif || null,
        keterangan: data.keterangan || null,
        entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
        retentionYears: data.retentionYears || 2,
        status: data.status || "ACTIVE",
      },
    });

    return NextResponse.json(archive, { status: 201 });
  } catch (error: any) {
    console.error("POST Archive error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create archive" },
      { status: 500 }
    );
  }
}
