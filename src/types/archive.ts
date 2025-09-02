// Archive record interface
export interface ArchiveRecord {
  id: string;
  kodeUnit?: string;
  indeks?: string;
  nomorBerkas?: string;
  nomorIsiBerkas?: string; // baru
  judulBerkas?: string;
  jenisNaskahDinas?: string; // ganti dari jenisNaskah
  nomorSurat?: string;
  klasifikasi?: string;
  perihal?: string;
  tanggal?: string;
  tingkatPerkembangan?: string;
  kondisi?: string;
  lokasiSimpan?: string; // ganti dari lokasi
  retensiAktif?: string;
  retensiInaktif?: string;
  keterangan?: string;
  entryDate: string;
  retentionYears: number;
  status: "ACTIVE" | "INACTIVE" | "DISPOSE_ELIGIBLE";
  createdAt: string;
  updatedAt: string;
}

// Form data interface
export interface ArchiveFormData {
  kodeUnit?: string;
  indeks?: string;
  nomorBerkas?: string;
  nomorIsiBerkas?: string; // baru
  judulBerkas?: string;
  jenisNaskahDinas?: string; // ganti dari jenisNaskah
  nomorSurat?: string;
  klasifikasi?: string;
  perihal?: string;
  tanggal?: string;
  tingkatPerkembangan?: string;
  kondisi?: string;
  lokasiSimpan?: string; // ganti dari lokasi
  retensiAktif?: string;
  retensiInaktif?: string;
  keterangan?: string;
  entryDate?: string;
  retentionYears?: number;
  status?: "ACTIVE" | "INACTIVE" | "DISPOSE_ELIGIBLE";
}

// Peminjaman interfaces
export interface PeminjamanRecord {
  id: string;
  nomorSurat: string;
  peminjam: string;
  keperluan: string;
  tanggalPinjam: string;
  tanggalHarusKembali: string;
  tanggalPengembalian?: string | null;
  archiveId: string;
  archive: ArchiveRecord;
  createdAt: string;
  updatedAt: string;
}

export interface PeminjamanFormData {
  nomorSurat: string;
  peminjam: string;
  keperluan: string;
  tanggalPinjam?: string; // optional karena bisa auto-set ke today
  tanggalHarusKembali?: string; // optional karena auto-calculated
  tanggalPengembalian?: string | null;
  archiveId: string;
}

// Pagination interface
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API response interface
export interface ArchiveResponse {
  data: ArchiveRecord[];
  pagination: PaginationData;
}

// Search/filter parameters
export interface ArchiveParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  filters?: Record<string, string>;
}

// Import result interface
export interface ImportResult {
  importJobId: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ImportError[];
}

// Import error interface
export interface ImportError {
  row: number;
  error: string;
  data: Record<string, any>;
}

// User interface (for header component)
export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}
