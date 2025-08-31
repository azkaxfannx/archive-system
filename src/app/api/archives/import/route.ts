import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json(
        { error: "File harus berformat Excel (.xlsx atau .xls)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let workbook;

    try {
      workbook = XLSX.read(buffer, { type: "buffer" });
    } catch (error) {
      return NextResponse.json(
        { error: "File Excel tidak valid atau corrupt" },
        { status: 400 }
      );
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { error: "File Excel tidak memiliki sheet" },
        { status: 400 }
      );
    }

    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    const batchEntryDate = new Date();

    interface ExcelRow {
      "KODE UNIT"?: string;
      INDEKS?: string;
      "NOMOR BERKAS"?: string;
      "JUDUL BERKAS"?: string;
      "JENIS NASKAH"?: string;
      "NOMOR SURAT"?: string;
      KLASIFIKASI?: string;
      "NOMOR SURAT 2"?: string;
      PERIHAL?: string;
      TANGGAL?: string | Date;
      "TINGKAT PERKEMBANGAN"?: string;
      KONDISI?: string;
      LOKASI?: string;
      "RETENSI AKTIF"?: string;
      "RETENSI INAKTIF"?: string;
      KETERANGAN?: string;
      "RETENTION YEARS"?: string | number;
      STATUS?: string;
      [key: string]: any;
    }

    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    ) as ExcelRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "File Excel kosong atau tidak memiliki data" },
        { status: 400 }
      );
    }

    for (const [index, row] of rows.entries()) {
      try {
        // Validasi kolom wajib
        if (!row["KODE UNIT"] || !row["NOMOR SURAT"] || !row["PERIHAL"]) {
          throw new Error(
            "Kolom KODE UNIT, NOMOR SURAT, dan PERIHAL wajib diisi"
          );
        }

        const statusMap: Record<
          string,
          "ACTIVE" | "INACTIVE" | "DISPOSE_ELIGIBLE"
        > = {
          ACTIVE: "ACTIVE",
          INACTIVE: "INACTIVE",
          DISPOSE_ELIGIBLE: "DISPOSE_ELIGIBLE",
          Aktif: "ACTIVE",
          "Tidak Aktif": "INACTIVE",
          "Siap Musnah": "DISPOSE_ELIGIBLE",
        };

        // Parse dates safely
        const parseExcelDateToISOString = (value: any): string | null => {
          if (!value) return null;

          let date: Date | null = null;

          if (value instanceof Date) date = value;
          else if (typeof value === "string") {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) date = parsed;
          } else if (typeof value === "number") {
            // serial Excel → Date
            const utc_days = Math.floor(value - 25569);
            const fractional_day = value - Math.floor(value);
            const date_utc = new Date(utc_days * 86400 * 1000);
            const total_seconds = Math.floor(86400 * fractional_day);
            const hours = Math.floor(total_seconds / 3600);
            const minutes = Math.floor(total_seconds / 60) % 60;
            const seconds = total_seconds % 60;
            date_utc.setHours(hours, minutes, seconds);
            date = date_utc;
          }

          if (!date) return null;

          // Set ke midnight lokal
          const localDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );

          // Ubah ke ISO string
          return localDate.toISOString(); // → "2025-06-02T00:00:00.000Z"
        };

        // Parse retention years
        const parseRetentionYears = (value: any): number => {
          if (typeof value === "number") return value;
          if (typeof value === "string") {
            const parsed = parseInt(value);
            return isNaN(parsed) ? 2 : parsed;
          }
          return 2;
        };

        // Simpan ke database
        await prisma.archive.create({
          data: {
            kodeUnit: row["KODE UNIT"]?.toString() || "",
            indeks: row["INDEKS"]?.toString() || null,
            nomorBerkas: row["NOMOR BERKAS"]?.toString() || null,
            judulBerkas: row["JUDUL BERKAS"]?.toString() || null,
            nomorIsiBerkas: row["NOMOR ISI BERKAS"]?.toString() || null,
            jenisNaskahDinas: row["JENIS NASKAH DINAS"]?.toString() || null,
            klasifikasi: row["KLASIFIKASI"]?.toString() || null,
            nomorSurat: row["NOMOR SURAT"]?.toString() || "",
            tanggal: parseExcelDateToISOString(row["TANGGAL"]),
            perihal: row["PERIHAL"]?.toString() || "",
            tahun: row["TAHUN"]
              ? parseInt(row["TAHUN"] as string)
              : row["TANGGAL"]
              ? new Date(row["TANGGAL"]).getFullYear()
              : null,
            tingkatPerkembangan:
              row["TINGKAT PERKEMBANGAN"]?.toString() || null,
            kondisi: row["KONDISI"]?.toString() || null,
            lokasiSimpan: row["LOKASI SIMPAN"]?.toString() || null,
            retensiAktif: row["RETENSI AKTIF"]?.toString() || null,
            keterangan: row["KETERANGAN"]?.toString() || null,
            entryDate: batchEntryDate,
            retentionYears: parseRetentionYears(row["RETENTION YEARS"]),
            status:
              row["STATUS"] && statusMap[row["STATUS"]?.toString()]
                ? statusMap[row["STATUS"]?.toString()]
                : "ACTIVE",
          },
        });

        success++;
      } catch (err: any) {
        failed++;
        console.error(`Error processing row ${index + 2}:`, err);
        errors.push({
          row: index + 2,
          error: err.message || "Unknown error",
          data: row,
        });
      }
    }

    return NextResponse.json({
      totalRows: rows.length,
      successRows: success,
      failedRows: failed,
      errors: errors.slice(0, 10), // Limit errors to first 10 for response size
    });
  } catch (error: any) {
    console.error("Import API error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mengimpor file" },
      { status: 500 }
    );
  }
}
