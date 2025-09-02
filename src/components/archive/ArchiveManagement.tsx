"use client";

import React, { useEffect, useState } from "react";
import {
  ArchiveRecord,
  ArchiveFormData,
  PeminjamanFormData,
} from "@/types/archive";
import { useArchives } from "@/hooks/useArchives";
import { archiveAPI } from "@/services/archiveAPI";
import * as XLSX from "xlsx";
import { PAGINATION } from "@/utils/constants";

// Components
import Header from "../layout/Header";
import StatsCards from "../ui/ArchiveStatsCards";
import Pagination from "../ui/Pagination";

import ArchiveTable from "./ArchiveTable";
import ArchiveForm from "./ArchiveForm";
import PeminjamanForm from "../peminjaman/PeminjamanForm";
import ImportModal from "../ui/modal/ImportModal";
import ArchiveDetailModal from "../ui/modal/ArchiveDetailModal";
import SuccessModal from "../ui/modal/SuccessModal";
import ExportResultModal from "../ui/modal/ExportResultModal";
import ImportResultModal from "../ui/modal/ImportResultModal";
import DeleteConfirmationModal from "../ui/modal/DeleteConfirmationModal";

export default function ArchiveManagement() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [showPeminjamanForm, setShowPeminjamanForm] = useState(false);

  // New state for period and year filters
  const [periodFilters, setPeriodFilters] = useState({
    startMonth: "",
    endMonth: "",
    year: "",
  });

  // Count states
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    disposeCount: 0,
  });

  useEffect(() => {
    fetch("/api/archives/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveRecord | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [exportResult, setExportResult] = useState<any | null>(null);
  const [showExportResultModal, setShowExportResultModal] = useState(false);

  const itemsPerPage = PAGINATION.DEFAULT_LIMIT;

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch archives with period filters
  const { archives, pagination, loading, error, mutate } = useArchives({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    sort: sortField,
    order: sortOrder,
    status: selectedFilter,
    filters: columnFilters,
    // Add period filters
    startMonth: periodFilters.startMonth,
    endMonth: periodFilters.endMonth,
    year: periodFilters.year,
  });

  // Header refresh trigger
  const [headerRefreshTrigger, setHeaderRefreshTrigger] = useState(0);

  const triggerHeaderRefresh = () => {
    setHeaderRefreshTrigger((prev) => prev + 1);
  };

  // Handle period filter changes
  const handlePeriodFilterChange = (
    field: keyof typeof periodFilters,
    value: string
  ) => {
    setPeriodFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // FIXED: Proper bidirectional sorting handler
  const handleSort = (field: string) => {
    console.log("Current sort state:", {
      sortField,
      sortOrder,
      clickedField: field,
    });

    if (sortField === field) {
      // Toggle direction jika field yang sama diklik
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      console.log("Toggling sort order to:", newOrder);
    } else {
      // Set field baru dengan default yang konsisten
      setSortField(field);
      // Untuk tanggal, default ke DESC agar terbaru di atas
      const defaultOrder = field === "tanggal" ? "desc" : "asc";
      setSortOrder(defaultOrder);
      console.log(
        "Setting new sort field:",
        field,
        "with default",
        defaultOrder
      );
    }
  };

  const [lastUpdate, setLastUpdate] = useState(
    new Date().toLocaleString("id-ID")
  );

  // IMPROVED: Column filter handler
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };

      if (value.trim() === "") {
        // Remove filter jika value kosong
        delete newFilters[column];
      } else {
        // Set filter value
        newFilters[column] = value;
      }

      return newFilters;
    });

    // Reset ke halaman pertama saat filter berubah
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Get all archives with current filters applied
      const queryParams = new URLSearchParams({
        limit: "999999", // Get all records
        search: searchQuery,
        status: selectedFilter,
        sort: sortField,
        order: sortOrder,
        ...(periodFilters.year && { year: periodFilters.year }),
        ...(periodFilters.startMonth && {
          startMonth: periodFilters.startMonth,
        }),
        ...(periodFilters.endMonth && { endMonth: periodFilters.endMonth }),
      });

      // Add column filters
      Object.entries(columnFilters).forEach(([key, value]) => {
        queryParams.append(`filter[${key}]`, value);
      });

      const response = await fetch(`/api/archives?${queryParams}`);
      const result = await response.json();
      const allArchives = result.data || [];

      const worksheet = XLSX.utils.json_to_sheet(
        allArchives.map((archive: any) => ({
          "KODE UNIT": archive.kodeUnit,
          INDEKS: archive.indeks,
          "NOMOR BERKAS": archive.nomorBerkas,
          "JUDUL BERKAS": archive.judulBerkas,
          "JENIS NASKAH DINAS": archive.jenisNaskahDinas,
          "NOMOR SURAT": archive.nomorSurat,
          KLASIFIKASI: archive.klasifikasi,
          PERIHAL: archive.perihal,
          "TANGGAL SURAT": archive.tanggal
            ? new Date(archive.tanggal).toLocaleDateString("id-ID")
            : "",
          "TINGKAT PERKEMBANGAN": archive.tingkatPerkembangan,
          KONDISI: archive.kondisi,
          "LOKASI SIMPAN": archive.lokasiSimpan,
          "RETENSI AKTIF": archive.retensiAktif,
          "RETENSI INAKTIF": archive.retensiInaktif,
          KETERANGAN: archive.keterangan,
          "RETENTION YEARS": archive.retentionYears,
          STATUS: archive.status,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Arsip");

      // Generate filename with period info
      let periodInfo = "";
      if (periodFilters.year) {
        periodInfo += `-${periodFilters.year}`;
        if (periodFilters.startMonth && periodFilters.endMonth) {
          periodInfo += `-bulan${periodFilters.startMonth}to${periodFilters.endMonth}`;
        }
      }

      const fileName = `data-arsip${periodInfo}-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // Simpan hasil export ke modal
      setExportResult({
        fileName,
        totalRows: allArchives.length,
      });
      setShowExportResultModal(true);
    } catch (error) {
      console.error("Export failed:", error);
      setExportResult({
        fileName: "Gagal Export",
        totalRows: 0,
      });
      setShowExportResultModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    const result = await archiveAPI.importExcel(file);

    // Simpan result ke state
    setImportResult(result);
    setShowImportResultModal(true);

    // Refresh data
    mutate();

    fetch("/api/archives/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));

    triggerHeaderRefresh();

    setShowImportModal(false);
  };

  // Handlers
  const handleSaveArchive = async (formData: ArchiveFormData) => {
    setIsLoading(true);
    try {
      if (selectedArchive) {
        await archiveAPI.updateArchive(selectedArchive.id, formData);
        setSuccessMessage("Arsip berhasil diperbarui!");
      } else {
        await archiveAPI.createArchive(formData);
        setSuccessMessage("Arsip berhasil ditambahkan!");
      }

      setShowAddForm(false);
      setSelectedArchive(null);
      mutate();

      fetch("/api/archives/stats")
        .then((res) => res.json())
        .then((data) => setStats(data));

      triggerHeaderRefresh();

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan arsip!");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinjamArchive = (archive: ArchiveRecord) => {
    setSelectedArchive(archive);
    setShowPeminjamanForm(true);
  };

  const handleSavePeminjaman = async (formData: PeminjamanFormData) => {
    setIsLoading(true);
    try {
      await archiveAPI.createPeminjaman(formData);
      setSuccessMessage("Peminjaman berkas berhasil dibuat!");

      setShowPeminjamanForm(false);
      setSelectedArchive(null);
      mutate(); // Refresh archives if needed

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating peminjaman:", error);
      alert("Terjadi kesalahan saat membuat peminjaman!");
    } finally {
      setIsLoading(false);
    }
  };

  // DEBUG: Log state changes
  useEffect(() => {
    console.log("Sort state changed:", { sortField, sortOrder });
  }, [sortField, sortOrder]);

  useEffect(() => {
    console.log("Column filters changed:", columnFilters);
  }, [columnFilters]);

  useEffect(() => {
    console.log("Period filters changed:", periodFilters);
  }, [periodFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        user={{ id: "1", name: "Admin" }}
        onLogout={() => alert("Logout!")}
        refreshTrigger={headerRefreshTrigger}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <StatsCards
          totalCount={stats.totalCount}
          activeCount={stats.activeCount}
          inactiveCount={stats.inactiveCount}
          disposeCount={stats.disposeCount}
        />

        {/* Archive Table */}
        <ArchiveTable
          archives={archives}
          loading={loading}
          onEdit={(archive) => {
            setSelectedArchive(archive);
            setShowAddForm(true);
          }}
          onDelete={async (id) => {
            setDeleteId(id);
            setShowDeleteModal(true);
          }}
          onView={(archive) => {
            setSelectedArchive(archive);
            setShowDetailModal(true);
          }}
          onPinjam={(archive) => handlePinjamArchive(archive)} // Tambahkan ini
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
          onColumnFilter={handleColumnFilter}
          onAdd={() => {
            setSelectedArchive(null);
            setShowAddForm(true);
          }}
          onImport={() => setShowImportModal(true)}
          onExport={handleExport}
          columnFilters={columnFilters}
          periodFilters={periodFilters}
          onPeriodFilterChange={handlePeriodFilterChange}
        />

        {/* Pagination */}
        {pagination && (
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (deleteId) {
            await archiveAPI.deleteArchive(deleteId);
            mutate();

            // refresh stats
            fetch("/api/archives/stats")
              .then((res) => res.json())
              .then((data) => setStats(data));

            triggerHeaderRefresh();
          }
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
      />

      {/* Archive Form Modal */}
      {showAddForm && (
        <ArchiveForm
          archive={selectedArchive || undefined}
          onSave={handleSaveArchive}
          onCancel={() => setShowAddForm(false)}
          loading={isLoading}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}

      {/* Export Result Modal */}
      <ExportResultModal
        isOpen={showExportResultModal}
        onClose={() => setShowExportResultModal(false)}
        result={exportResult}
      />

      {/* Import Result Modal */}
      <ImportResultModal
        isOpen={showImportResultModal}
        onClose={() => setShowImportResultModal(false)}
        result={importResult}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedArchive && (
        <ArchiveDetailModal
          archive={selectedArchive}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Peminjaman Form Modal */}
      {showPeminjamanForm && selectedArchive && (
        <PeminjamanForm
          archive={selectedArchive}
          onSave={handleSavePeminjaman}
          onCancel={() => setShowPeminjamanForm(false)}
          loading={isLoading}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
