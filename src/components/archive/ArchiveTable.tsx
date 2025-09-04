"use client";

import React, { useRef, useEffect, useState, RefObject } from "react";
import {
  Eye,
  Edit2,
  Archive,
  Trash2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Calendar,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { ArchiveRecord } from "@/types/archive";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PeriodFilters {
  startMonth: string;
  endMonth: string;
  year: string;
}

interface ArchiveTableProps {
  archives: ArchiveRecord[];
  loading: boolean;
  onEdit: (archive: ArchiveRecord) => void;
  onDelete: (id: string) => void;
  onView: (archive: ArchiveRecord) => void;
  onPinjam: (archive: ArchiveRecord) => void;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onColumnFilter: (column: string, value: string) => void;
  columnFilters: Record<string, string>;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  periodFilters: PeriodFilters;
  onPeriodFilterChange: (field: keyof PeriodFilters, value: string) => void;
  refreshTrigger?: number;
}

const TABLE_HEADERS = [
  { key: "nomorSurat", label: "No. Surat", sortable: true },
  {
    key: "tanggal",
    label: "Tgl Surat",
    sortable: true,
    tooltip: "Diurutkan berdasarkan tanggal surat",
  },
  { key: "nomorBerkas", label: "No. Berkas", sortable: true },
  { key: "judulBerkas", label: "Judul Berkas", sortable: false },
  { key: "lokasiSimpan", label: "Lokasi Simpan", sortable: true },
  { key: "retensi", label: "Retensi", sortable: false },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

const MONTHS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function ArchiveTable({
  archives,
  loading,
  onEdit,
  onDelete,
  onView,
  onPinjam,
  onSort,
  sortField,
  sortOrder,
  onColumnFilter,
  columnFilters,
  onAdd,
  onImport,
  onExport,
  periodFilters,
  onPeriodFilterChange,
  refreshTrigger = 0,
}: ArchiveTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showPeriodFilters, setShowPeriodFilters] = useState(false);
  const [activePeminjaman, setActivePeminjaman] = useState<
    Record<string, boolean>
  >({});

  // Local filter state yang sama dengan PeminjamanTable
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalFilters(columnFilters);
  }, [columnFilters]);

  // Fetch active peminjaman status for all archives
  useEffect(() => {
    const fetchActivePeminjaman = async () => {
      try {
        const archiveIds = archives.map((archive) => archive.id);
        if (archiveIds.length === 0) {
          setActivePeminjaman({});
          return;
        }

        // Check each archive for active peminjaman
        const promises = archiveIds.map(async (archiveId) => {
          const response = await fetch(
            `/api/peminjaman?archiveId=${archiveId}`
          );
          const result = await response.json();

          if (result.success && result.data) {
            // Check if there's any active peminjaman (tanggalPengembalian is null)
            const hasActivePeminjaman = result.data.some(
              (p: any) => p.tanggalPengembalian === null
            );
            return { archiveId, hasActivePeminjaman };
          }
          return { archiveId, hasActivePeminjaman: false };
        });

        const results = await Promise.all(promises);
        const activePeminjamanMap = results.reduce(
          (acc, { archiveId, hasActivePeminjaman }) => {
            acc[archiveId] = hasActivePeminjaman;
            return acc;
          },
          {} as Record<string, boolean>
        );

        setActivePeminjaman(activePeminjamanMap);
      } catch (error) {
        console.error("Error fetching active peminjaman:", error);
        setActivePeminjaman({});
      }
    };

    if (archives.length > 0) {
      fetchActivePeminjaman();
    }
  }, [archives, refreshTrigger]);

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  // Handler yang sama dengan PeminjamanTable - dengan debounce 300ms
  const handleInputChange = (column: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [column]: value }));

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onColumnFilter(column, value);
    }, 300);
  };

  // Generate years for dropdown (current year ± 10 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 2; i >= currentYear - 10; i--) {
      years.push(i);
    }
    return years;
  };

  // Check if period filters are active
  const hasPeriodFilters =
    periodFilters.year || periodFilters.startMonth || periodFilters.endMonth;

  // Get period filter display text
  const getPeriodFilterText = () => {
    if (!hasPeriodFilters) return "";

    let text = "";
    if (periodFilters.year) {
      text += `Tahun ${periodFilters.year}`;
    }

    if (periodFilters.startMonth && periodFilters.endMonth) {
      const startMonthName = MONTHS.find(
        (m) => m.value === periodFilters.startMonth
      )?.label;
      const endMonthName = MONTHS.find(
        (m) => m.value === periodFilters.endMonth
      )?.label;

      if (periodFilters.startMonth === periodFilters.endMonth) {
        text += text ? ` - ${startMonthName}` : `Bulan ${startMonthName}`;
      } else {
        text += text
          ? ` - ${startMonthName} s/d ${endMonthName}`
          : `${startMonthName} s/d ${endMonthName}`;
      }
    }

    return text;
  };

  // Clear period filters
  const clearPeriodFilters = () => {
    onPeriodFilterChange("year", "");
    onPeriodFilterChange("startMonth", "");
    onPeriodFilterChange("endMonth", "");
  };

  // Simple alternating row colors
  const getRowColorClass = (index: number) => {
    return index % 2 === 0 ? "bg-white" : "bg-gray-50";
  };

  // Helper function to format date safely
  const formatDocumentDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  // Helper function to check if archive can be borrowed
  const canBorrow = (archiveId: string) => {
    return !activePeminjaman[archiveId];
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Period Filters Banner */}
      {hasPeriodFilters && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Filter Periode: {getPeriodFilterText()}
            </span>
          </div>
          <button
            onClick={clearPeriodFilters}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* Filters Toggle */}
      <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {archives.length} arsip ditemukan
        </span>

        <div className="flex items-center space-x-2">
          {/* Tombol Export */}
          <button
            onClick={onExport}
            className="px-3 py-1.5 text-sm rounded bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
          >
            Export Excel
          </button>

          {/* Tombol Import */}
          <button
            onClick={onImport}
            className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Import Excel
          </button>

          {/* Tombol Tambah */}
          <button
            onClick={onAdd}
            className="px-3 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            + Tambah Arsip
          </button>

          {/* Toggle Period Filter */}
          <button
            onClick={() => setShowPeriodFilters(!showPeriodFilters)}
            className={`text-sm flex items-center transition-colors px-3 py-1.5 rounded ${
              hasPeriodFilters
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            }`}
          >
            <CalendarDays size={16} className="mr-1" />
            {showPeriodFilters ? "Sembunyikan" : "Filter"} Periode
          </button>

          {/* Toggle Column Filter */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            <Filter size={16} className="mr-1" />
            {showFilters ? "Sembunyikan" : "Filter"} Kolom
          </button>
        </div>
      </div>

      {/* Period Filters */}
      {showPeriodFilters && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
            <CalendarDays size={16} className="mr-2" />
            Filter Berdasarkan Periode dan Tahun
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year Filter */}
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Tahun
              </label>
              <select
                value={periodFilters.year}
                onChange={(e) => onPeriodFilterChange("year", e.target.value)}
                className="w-full text-sm border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Semua Tahun</option>
                {generateYears().map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Month Filter */}
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Dari Bulan
              </label>
              <select
                value={periodFilters.startMonth}
                onChange={(e) =>
                  onPeriodFilterChange("startMonth", e.target.value)
                }
                className="w-full text-sm border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Pilih Bulan</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* End Month Filter */}
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Sampai Bulan
              </label>
              <select
                value={periodFilters.endMonth}
                onChange={(e) =>
                  onPeriodFilterChange("endMonth", e.target.value)
                }
                className="w-full text-sm border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Pilih Bulan</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Period Filter Hint */}
          <p className="text-xs text-blue-600 mt-2">
            <strong>Tips:</strong> Pilih tahun untuk memfilter berdasarkan tahun
            saja, atau kombinasikan dengan bulan untuk periode yang lebih
            spesifik.
            {periodFilters.startMonth &&
              !periodFilters.endMonth &&
              " Pilih 'Sampai Bulan' untuk rentang periode."}
          </p>
        </div>
      )}

      {/* Column Filters - Diperbaiki seperti PeminjamanTable */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nomor Surat
              </label>
              <input
                type="text"
                value={
                  localFilters.nomorSurat || columnFilters.nomorSurat || ""
                }
                onChange={(e) =>
                  handleInputChange("nomorSurat", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter nomor surat..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Judul Berkas
              </label>
              <input
                type="text"
                value={
                  localFilters.judulBerkas || columnFilters.judulBerkas || ""
                }
                onChange={(e) =>
                  handleInputChange("judulBerkas", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter judul berkas..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Lokasi Simpan
              </label>
              <input
                type="text"
                value={
                  localFilters.lokasiSimpan || columnFilters.lokasiSimpan || ""
                }
                onChange={(e) =>
                  handleInputChange("lokasiSimpan", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter lokasi simpan..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Jenis Naskah
              </label>
              <select
                value={
                  localFilters.jenisNaskahDinas ||
                  columnFilters.jenisNaskahDinas ||
                  ""
                }
                onChange={(e) =>
                  handleInputChange("jenisNaskahDinas", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Jenis</option>
                <option value="Surat Masuk">Surat Masuk</option>
                <option value="Surat Keluar">Surat Keluar</option>
                <option value="Memo">Memo</option>
                <option value="Laporan">Laporan</option>
                <option value="SK">SK</option>
                <option value="Notulen">Notulen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={localFilters.status || columnFilters.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Inaktif</option>
                <option value="DISPOSE_ELIGIBLE">Siap Musnah</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <LoadingSpinner />
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header.key}
                  onClick={() => header.sortable && onSort(header.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    header.sortable
                      ? "cursor-pointer hover:bg-gray-100 transition-colors"
                      : ""
                  }`}
                  title={
                    header.tooltip ||
                    (header.sortable ? "Klik untuk mengurutkan" : "")
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{header.label}</span>
                    {header.sortable && getSortIcon(header.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {archives.map((archive, index) => (
              <tr
                key={archive.id}
                className={`hover:bg-blue-50 transition-colors ${getRowColorClass(
                  index
                )} ${!canBorrow(archive.id) ? "bg-red-50" : ""}`}
              >
                {/* No. Surat */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {archive.nomorSurat}
                    {!canBorrow(archive.id) && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Sedang Dipinjam
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-32">
                    {archive.klasifikasi}
                  </div>
                </td>

                {/* Tgl Surat */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDocumentDate(archive.tanggal)}
                  </div>
                  <div className="text-sm text-gray-500">{archive.indeks}</div>
                </td>

                {/* No. Berkas */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 max-w-32 truncate">
                    {archive.nomorBerkas}
                  </div>
                  <div className="text-sm text-gray-500">
                    {archive.jenisNaskahDinas}
                  </div>
                </td>

                {/* Judul Berkas */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    <div className="truncate">{archive.judulBerkas}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {archive.perihal}
                    </div>
                  </div>
                </td>

                {/* Lokasi Simpan */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {archive.lokasiSimpan}
                  </div>
                  <div className="text-sm text-gray-500">
                    {archive.tingkatPerkembangan} • {archive.kondisi}
                  </div>
                </td>

                {/* Retensi */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {archive.retentionYears} tahun
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={archive.status} />
                </td>

                {/* Aksi */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onView(archive)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Conditional Pinjam Button */}
                    {canBorrow(archive.id) ? (
                      <button
                        onClick={() => onPinjam(archive)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                        title="Pinjam Berkas"
                      >
                        <BookOpen size={16} />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-gray-400 p-1 rounded cursor-not-allowed"
                        title="Arsip sedang dipinjam"
                      >
                        <BookOpen size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => onEdit(archive)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(archive.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {archives.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada arsip ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            {hasPeriodFilters || Object.keys(columnFilters).length > 0
              ? "Coba ubah filter pencarian atau periode yang dipilih"
              : "Coba ubah filter pencarian atau tambah arsip baru"}
          </p>
          {hasPeriodFilters && (
            <button
              onClick={clearPeriodFilters}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Hapus Filter Periode
            </button>
          )}
        </div>
      )}
    </div>
  );
}
