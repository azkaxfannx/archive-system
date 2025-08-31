"use client";

import React, { useEffect, useState } from "react";
import { ArchiveRecord, ArchiveFormData } from "@/types/archive";
import { useArchives } from "@/hooks/useArchives";
import { archiveAPI } from "@/services/archiveAPI";
import * as XLSX from "xlsx";
import { PAGINATION } from "@/utils/constants";

// Components
import Header from "../layout/Header";
import StatsCards from "../ui/StatsCards";
import Pagination from "../ui/Pagination";

import ArchiveTable from "./ArchiveTable";
import ArchiveForm from "./ArchiveForm";
import ImportModal from "./ImportModal";
import ArchiveDetailModal from "./ArchiveDetailModal";
import SuccessModal from "./SuccessModal";
import ExportResultModal from "./ExportResultModal";
import ImportResultModal from "./ImportResultModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function ArchiveManagement() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("entryDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );

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

  // Fetch archives
  const { archives, pagination, loading, error, mutate } = useArchives({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    sort: sortField,
    order: sortOrder,
    status: selectedFilter,
    filters: columnFilters,
  });

  // ✅ Header refresh trigger
  const [headerRefreshTrigger, setHeaderRefreshTrigger] = useState(0);

  const triggerHeaderRefresh = () => {
    setHeaderRefreshTrigger((prev) => prev + 1);
  };

  // ✅ FIXED: Proper bidirectional sorting handler
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
      // ✅ Untuk entryDate, default ke DESC agar terbaru di atas
      const defaultOrder = field === "entryDate" ? "desc" : "asc";
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

  // ✅ IMPROVED: Column filter handler
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

      const allArchives = await archiveAPI.getAllArchives();

      const worksheet = XLSX.utils.json_to_sheet(
        allArchives.map((archive) => ({
          "KODE UNIT": archive.kodeUnit,
          INDEKS: archive.indeks,
          "NOMOR BERKAS": archive.nomorBerkas,
          "JUDUL BERKAS": archive.judulBerkas,
          "JENIS NASKAH DINAS": archive.jenisNaskahDinas,
          "NOMOR SURAT": archive.nomorSurat,
          KLASIFIKASI: archive.klasifikasi,
          PERIHAL: archive.perihal,
          TANGGAL: archive.tanggal
            ? new Date(archive.tanggal).toLocaleDateString("id-ID")
            : "",
          "TINGKAT PERKEMBANGAN": archive.tingkatPerkembangan,
          KONDISI: archive.kondisi,
          "LOKASI SIMPAN": archive.lokasiSimpan,
          "RETENSI AKTIF": archive.retensiAktif,
          "RETENSI INAKTIF": archive.retensiInaktif,
          KETERANGAN: archive.keterangan,
          "ENTRY DATE": new Date(archive.entryDate).toLocaleDateString("id-ID"),
          "RETENTION YEARS": archive.retentionYears,
          STATUS: archive.status,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Arsip");

      const fileName = `data-arsip-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // ✅ Simpan hasil export ke modal
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

      // ✅ Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan arsip!");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DEBUG: Log state changes
  useEffect(() => {
    console.log("Sort state changed:", { sortField, sortOrder });
  }, [sortField, sortOrder]);

  useEffect(() => {
    console.log("Column filters changed:", columnFilters);
  }, [columnFilters]);

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
          onSort={handleSort} // ✅ FIXED: Use proper sort handler
          sortField={sortField}
          sortOrder={sortOrder}
          onColumnFilter={handleColumnFilter} // ✅ IMPROVED: Use proper filter handler
          onAdd={() => {
            setSelectedArchive(null);
            setShowAddForm(true);
          }}
          onImport={() => setShowImportModal(true)}
          onExport={handleExport}
          columnFilters={columnFilters}
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
