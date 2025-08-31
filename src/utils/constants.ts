// Archive status options
export const ARCHIVE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DISPOSE_ELIGIBLE: "DISPOSE_ELIGIBLE",
} as const;

// Status configuration for badges
export const STATUS_CONFIG = {
  ACTIVE: {
    color: "bg-green-100 text-green-800 border-green-200",
    text: "Aktif",
  },
  INACTIVE: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    text: "Inaktif",
  },
  DISPOSE_ELIGIBLE: {
    color: "bg-red-100 text-red-800 border-red-200",
    text: "Siap Musnah",
  },
} as const;

// Form options
export const JENIS_NASKAH_OPTIONS = [
  "Surat Masuk",
  "Surat Keluar",
  "Memo",
  "Laporan",
  "Nota Dinas",
  "Surat Keputusan",
];

export const TINGKAT_PERKEMBANGAN_OPTIONS = [
  "Asli",
  "Copy",
  "Salinan",
  "Tembusan",
];

export const KONDISI_OPTIONS = [
  "Baik",
  "Rusak Ringan",
  "Rusak Berat",
  "Hilang",
];

export const RETENSI_AKTIF_OPTIONS = [
  "1 Tahun",
  "2 Tahun",
  "3 Tahun",
  "5 Tahun",
  "10 Tahun",
  "Permanen",
];

export const RETENSI_INAKTIF_OPTIONS = [
  "Tekstual",
  "Musnah",
  "Permanen",
  "Serah ke Arsip Nasional",
];

// Default form values
export const DEFAULT_FORM_VALUES = {
  kodeUnit: "",
  indeks: "",
  nomorBerkas: "",
  judulBerkas: "",
  nomorIsiBerkas: "",
  jenisNaskahDinas: "Surat Masuk",
  klasifikasi: "",
  nomorSurat: "",
  nomorSurat2: "",
  perihal: "",
  tanggal: new Date().toISOString().split("T")[0],
  entryDate: new Date().toISOString().split("T")[0],
  tahun: new Date().getFullYear(),
  tingkatPerkembangan: "Asli",
  kondisi: "Baik",
  lokasiSimpan: "",
  retensiAktif: "2 Tahun",
  retensiInaktif: "Tekstual",
  retentionYears: 2,
  keterangan: "",
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [".xlsx", ".xls"],
  MIME_TYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
} as const;
