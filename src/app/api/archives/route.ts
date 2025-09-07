import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/utils/withAuth";

// GET - Fetch archives with pagination and filters
export async function GET(req: NextRequest) {
  try {
    console.log("=== ARCHIVES API DEBUG ===");
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    console.log("Cookies:", Object.fromEntries(req.cookies));

    const authToken = req.cookies.get("auth-token")?.value;
    console.log("Auth token found:", authToken ? "YES" : "NO");

    const { user, error } = requireAuth(req);
    console.log("Auth result:", { user: !!user, error: !!error });

    if (error) {
      console.log("Auth failed, returning error");
      return error;
    }

    console.log("Auth successful, user:", user);

    // Rest of your existing code...
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "tanggal";
    const order = searchParams.get("order") || "desc";

    // New filter parameters for period and year
    const startMonth = searchParams.get("startMonth");
    const endMonth = searchParams.get("endMonth");
    const filterYear = searchParams.get("year");

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

    // Period and Year filtering
    if (filterYear || startMonth || endMonth) {
      if (filterYear) {
        const year = parseInt(filterYear);

        if (startMonth && endMonth) {
          // Filter by specific period within the year
          const startMonthNum = parseInt(startMonth) - 1; // Month is 0-indexed
          const endMonthNum = parseInt(endMonth) - 1;

          const periodStart = new Date(year, startMonthNum, 1);
          const periodEnd = new Date(year, endMonthNum + 1, 0, 23, 59, 59); // Last day of end month

          where.tanggal = {
            gte: periodStart,
            lte: periodEnd,
          };
        } else {
          // Filter by year only
          const startDate = new Date(year, 0, 1); // January 1st
          const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

          where.tanggal = {
            gte: startDate,
            lte: endDate,
          };
        }
      } else if (startMonth && endMonth) {
        // Filter by months across current year if no year specified
        const currentYear = new Date().getFullYear();
        const startMonthNum = parseInt(startMonth) - 1;
        const endMonthNum = parseInt(endMonth) - 1;

        const periodStart = new Date(currentYear, startMonthNum, 1);
        const periodEnd = new Date(currentYear, endMonthNum + 1, 0, 23, 59, 59);

        where.tanggal = {
          gte: periodStart,
          lte: periodEnd,
        };
      }
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
          case "status":
            where.status = value as any;
            break;
          case "kodeUnit":
            where.kodeUnit = { contains: value, mode: "insensitive" };
            break;
        }
      }
    });

    const orderBy: Prisma.ArchiveOrderByWithRelationInput = {};
    switch (sort) {
      case "tanggal":
        // Sort by tanggal surat, with fallback to entryDate for null values
        orderBy.tanggal = order as "asc" | "desc";
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
        // Fallback ke tanggal desc jika sort field tidak dikenali
        orderBy.tanggal = "desc";
    }

    const skip = (page - 1) * limit;

    const userFilter = user.role === "ADMIN" ? {} : { userId: user.userId };

    const finalWhere: Prisma.ArchiveWhereInput = {
      ...where,
      ...userFilter,
    };

    const [archives, total] = await Promise.all([
      prisma.archive.findMany({
        where: finalWhere,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.archive.count({
        where: finalWhere,
      }),
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
    const { user, error } = requireAuth(req);
    if (error) return error;

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
        userId: user.userId,
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
