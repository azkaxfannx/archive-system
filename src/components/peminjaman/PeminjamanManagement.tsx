// components/peminjaman/PeminjamanManagement.tsx
"use client";

import React, { useEffect, useState } from "react";
import Header from "../layout/Header";
import PeminjamanStatsCards from "../ui/PeminjamanStatsCards";

import PeminjamanTable from "./PeminjamanTable";
import { PeminjamanRecord, PeminjamanFormData } from "@/types/archive";
import { archiveAPI } from "@/services/archiveAPI";
import * as XLSX from "xlsx";
import SuccessModal from "../ui/modal/SuccessModal";
import PeminjamanEditForm from "./PeminjamanEditForm";
import ReturnConfirmationModal from "./ReturnConfirmationModal";

export default function PeminjamanManagement() {
  const [peminjaman, setPeminjaman] = useState<PeminjamanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>("tanggalPinjam");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [periodFilters, setPeriodFilters] = useState({
    startMonth: "",
    endMonth: "",
    year: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // edit modal
  const [editingItem, setEditingItem] = useState<PeminjamanRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // return modal
  const [returningItem, setReturningItem] = useState<PeminjamanRecord | null>(
    null
  );
  const [returning, setReturning] = useState(false);

  // header refresh trigger (optional, jika Header pakai ini)
  const [headerRefreshTrigger, setHeaderRefreshTrigger] = useState(0);
  const triggerHeaderRefresh = () => setHeaderRefreshTrigger((v) => v + 1);

  // stats state
  const [stats, setStats] = useState({
    totalCount: 0,
    ongoingCount: 0,
    returnedCount: 0,
    overdueCount: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/peminjaman/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch peminjaman stats:", e);
    }
  };

  const fetchPeminjaman = async () => {
    try {
      setLoading(true);
      const result = await archiveAPI.getAllPeminjaman();
      setPeminjaman(result || []);
    } catch (err) {
      console.error("Error fetching peminjaman:", err);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchPeminjaman();
    fetchStats();
  }, []);

  const handleEdit = (item: PeminjamanRecord) => setEditingItem(item);

  const handleSaveEdit = async (data: PeminjamanFormData) => {
    if (!editingItem) return;
    try {
      setSaving(true);
      await archiveAPI.updatePeminjaman(editingItem.id, {
        ...editingItem,
        ...data,
      });
      await fetchPeminjaman();
      await fetchStats();
      triggerHeaderRefresh();
      setEditingItem(null);

      // ✅ tampilkan modal sukses
      setSuccessMessage("Data peminjaman berhasil diperbarui.");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error updating peminjaman:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => setEditingItem(null);

  const handleKembalikan = (item: PeminjamanRecord) => {
    setReturningItem(item);
  };

  const confirmKembalikan = async () => {
    if (!returningItem) return;
    try {
      setReturning(true);
      await archiveAPI.updatePeminjaman(returningItem.id, {
        ...returningItem,
        tanggalPengembalian: new Date().toISOString(),
      });
      await fetchPeminjaman();
      await fetchStats();
      triggerHeaderRefresh();
      setReturningItem(null);

      // ✅ tampilkan modal sukses
      setSuccessMessage("Berkas berhasil dikembalikan.");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error mengembalikan peminjaman:", err);
    } finally {
      setReturning(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const handleStatusFilterChange = (status: string) => setStatusFilter(status);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allPeminjaman = await archiveAPI.getAllPeminjaman();
      const worksheet = XLSX.utils.json_to_sheet(
        allPeminjaman.map((item: PeminjamanRecord) => ({
          "NOMOR SURAT": item.nomorSurat,
          PEMINJAM: item.peminjam,
          "NOMOR BERKAS": item.archive?.nomorBerkas || "-",
          "JUDUL BERKAS": item.archive?.judulBerkas || "-",
          "TANGGAL PINJAM": new Date(item.tanggalPinjam).toLocaleDateString(
            "id-ID"
          ),
          "TANGGAL HARUS KEMBALI": new Date(
            item.tanggalHarusKembali
          ).toLocaleDateString("id-ID"),
          "TANGGAL PENGEMBALIAN": item.tanggalPengembalian
            ? new Date(item.tanggalPengembalian).toLocaleDateString("id-ID")
            : "-",
          STATUS: item.tanggalPengembalian
            ? "kembali"
            : new Date() > new Date(item.tanggalHarusKembali)
            ? "terlambat"
            : "aktif",
          KEPERLUAN: item.keperluan,
          KETERANGAN: item.archive?.keterangan || "-",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman");
      XLSX.writeFile(workbook, "data_peminjaman.xlsx");
    } catch (err) {
      console.error("Error exporting peminjaman:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // filter & sort
  const filteredData = peminjaman.filter((item) => {
    const matchesFilters = Object.entries(columnFilters).every(
      ([column, value]) => {
        if (!value) return true;
        if (column === "judulBerkas") {
          return item.archive?.judulBerkas
            ?.toLowerCase()
            .includes(value.toLowerCase());
        }
        const fieldValue = (item as any)[column];
        return fieldValue
          ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
          : false;
      }
    );

    // hitung status
    const today = new Date();
    let computedStatus = "aktif";
    if (item.tanggalPengembalian) computedStatus = "kembali";
    else if (today > new Date(item.tanggalHarusKembali))
      computedStatus = "terlambat";

    const matchesStatus =
      statusFilter === "" || computedStatus === statusFilter;

    // filter berdasarkan periode
    let matchesPeriod = true;
    if (periodFilters.year) {
      const year = new Date(item.tanggalPinjam).getFullYear();
      matchesPeriod = year === parseInt(periodFilters.year);
    }
    if (periodFilters.startMonth && periodFilters.endMonth) {
      const month = new Date(item.tanggalPinjam).getMonth() + 1; // 1-based
      matchesPeriod =
        matchesPeriod &&
        month >= parseInt(periodFilters.startMonth) &&
        month <= parseInt(periodFilters.endMonth);
    }

    return matchesFilters && matchesStatus && matchesPeriod;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue =
      sortField === "judulBerkas"
        ? a.archive?.judulBerkas || ""
        : (a as any)[sortField] || "";
    const bValue =
      sortField === "judulBerkas"
        ? b.archive?.judulBerkas || ""
        : (b as any)[sortField] || "";
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handlePeriodFilterChange = (
    field: keyof typeof periodFilters,
    value: string
  ) => {
    setPeriodFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (samakan dengan ArchiveManagement) */}
      <Header
        // user={{ id: "1", name: "Admin" }}
        // onLogout={() => alert("Logout!")}
        refreshTrigger={headerRefreshTrigger}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards Peminjaman */}
        <PeminjamanStatsCards
          totalCount={stats.totalCount}
          ongoingCount={stats.ongoingCount}
          returnedCount={stats.returnedCount}
          overdueCount={stats.overdueCount}
        />

        {/* Tabel */}
        <PeminjamanTable
          peminjaman={sortedData}
          loading={loading}
          onEdit={handleEdit}
          onKembalikan={handleKembalikan}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
          onColumnFilter={handleColumnFilter}
          columnFilters={columnFilters}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onExport={handleExport}
          isExporting={isExporting}
          periodFilters={periodFilters}
          onPeriodFilterChange={handlePeriodFilterChange}
        />
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <PeminjamanEditForm
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          loading={saving}
        />
      )}

      {/* Return Confirmation Modal */}
      {returningItem && (
        <ReturnConfirmationModal
          isOpen={!!returningItem}
          onClose={() => setReturningItem(null)}
          onConfirm={confirmKembalikan}
          loading={returning}
          peminjam={returningItem.peminjam}
          judulBerkas={returningItem.archive?.judulBerkas}
        />
      )}

      {/* ✅ Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
