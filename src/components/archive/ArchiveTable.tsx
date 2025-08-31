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
} from "lucide-react";
import { ArchiveRecord } from "@/types/archive";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ArchiveTableProps {
  archives: ArchiveRecord[];
  loading: boolean;
  onEdit: (archive: ArchiveRecord) => void;
  onDelete: (id: string) => void;
  onView: (archive: ArchiveRecord) => void;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onColumnFilter: (column: string, value: string) => void;
  columnFilters: Record<string, string>;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
}

const TABLE_HEADERS = [
  { key: "nomorSurat", label: "No. Surat", sortable: true },
  {
    key: "entryDate",
    label: "Tgl Entry",
    sortable: true,
    tooltip: "Diurutkan berdasarkan tanggal dan jam",
  },
  { key: "nomorBerkas", label: "No. Berkas", sortable: true },
  { key: "judulBerkas", label: "Judul Berkas", sortable: false },
  { key: "lokasiSimpan", label: "Lokasi Simpan", sortable: true },
  { key: "retensi", label: "Retensi", sortable: false },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

export default function ArchiveTable({
  archives,
  loading,
  onEdit,
  onDelete,
  onView,
  onSort,
  sortField,
  sortOrder,
  onColumnFilter,
  columnFilters,
  onAdd,
  onImport,
  onExport,
}: ArchiveTableProps) {
  const [showFilters, setShowFilters] = useState(false);

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

  const inputRefs = {
    nomorSurat: useRef<HTMLInputElement>(null),
    judulBerkas: useRef<HTMLInputElement>(null),
    lokasiSimpan: useRef<HTMLInputElement>(null),
  };

  const selectRefs = {
    jenisNaskahDinas: useRef<HTMLSelectElement>(null),
  };

  const [focusedColumn, setFocusedColumn] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  const handleInputChange = (column: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [column]: value }));
    setFocusedColumn(column);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      Object.entries(localFilters).forEach(([col, val]) => {
        onColumnFilter(col, val);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [localFilters]);

  // Opsi 1: Gunakan index sederhana (paling simple dan reliable)
  const getRowColorClass = (index: number) => {
    return index % 2 === 0 ? "bg-white" : "bg-gray-50";
  };

  // Opsi 2: Jika tetap ingin berdasarkan ID, gunakan hash yang lebih baik
  // const getRowColorClass = (id: string) => {
  //   // Simple hash function yang lebih reliable
  //   let hash = 0;
  //   for (let i = 0; i < id.length; i++) {
  //     const char = id.charCodeAt(i);
  //     hash = ((hash << 5) - hash) + char;
  //     hash = hash & hash; // Convert to 32-bit integer
  //   }
  //   return Math.abs(hash) % 2 === 0 ? "bg-white" : "bg-gray-50";
  // };

  // Opsi 3: Berdasarkan karakter terakhir dari ID
  // const getRowColorClass = (id: string) => {
  //   const lastChar = id.slice(-1);
  //   const charCode = lastChar.charCodeAt(0);
  //   return charCode % 2 === 0 ? "bg-white" : "bg-gray-50";
  // };

  // const handleDeleteAction = (id: string) => {
  //   if (window.confirm("Yakin ingin menghapus arsip ini?")) {
  //     onDelete(id);
  //   }
  // };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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

          {/* Toggle Filter */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            <Filter size={16} className="mr-1" />
            {showFilters ? "Sembunyikan" : "Tampilkan"} Filter Kolom
          </button>
        </div>
      </div>

      {/* Column Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nomor Surat
              </label>
              <input
                ref={inputRefs.nomorSurat}
                type="text"
                value={
                  localFilters.nomorSurat || columnFilters.nomorSurat || ""
                }
                onChange={(e) =>
                  handleInputChange("nomorSurat", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Judul Berkas
              </label>
              <input
                ref={inputRefs.judulBerkas}
                type="text"
                value={
                  localFilters.judulBerkas || columnFilters.judulBerkas || ""
                }
                onChange={(e) =>
                  handleInputChange("judulBerkas", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Lokasi Simpan
              </label>
              <input
                ref={inputRefs.lokasiSimpan}
                type="text"
                value={
                  localFilters.lokasiSimpan || columnFilters.lokasiSimpan || ""
                }
                onChange={(e) =>
                  handleInputChange("lokasiSimpan", e.target.value)
                }
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Jenis
              </label>
              <select
                ref={selectRefs.jenisNaskahDinas}
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
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
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
                )}`}
              >
                {/* No. Surat */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {archive.nomorSurat}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-32">
                    {archive.klasifikasi}
                  </div>
                </td>

                {/* Tgl Entry */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(archive.entryDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-sm text-gray-500">{archive.indeks}</div>
                </td>

                {/* Asal/Berkas */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 max-w-32 truncate">
                    {archive.nomorBerkas}
                  </div>
                  <div className="text-sm text-gray-500">
                    {archive.jenisNaskahDinas}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    <div className="truncate">{archive.judulBerkas}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {archive.perihal}
                    </div>
                  </div>
                </td>

                {/* Lokasi */}
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
          <p className="text-gray-500">
            Coba ubah filter pencarian atau tambah arsip baru
          </p>
        </div>
      )}
    </div>
  );
}
