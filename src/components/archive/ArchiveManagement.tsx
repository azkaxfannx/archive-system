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

// Error Modal Component for Peminjaman
const PeminjamanErrorModal = ({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Arsip Sedang Dipinjam
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Peminjaman Error Modal
  const [showPeminjamanErrorModal, setShowPeminjamanErrorModal] =
    useState(false);
  const [peminjamanErrorMessage, setPeminjamanErrorMessage] = useState("");

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
  // Table refresh trigger for peminjaman status
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);

  const triggerHeaderRefresh = () => {
    setHeaderRefreshTrigger((prev) => prev + 1);
  };

  const triggerTableRefresh = () => {
    setTableRefreshTrigger((prev) => prev + 1);
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

  // FIXED: Enhanced handleSavePeminjaman with consistent error handling and refresh trigger
  const handleSavePeminjaman = async (formData: PeminjamanFormData) => {
    setIsLoading(true);
    try {
      console.log("Creating peminjaman with data:", formData);
      await archiveAPI.createPeminjaman(formData);
      setSuccessMessage("Peminjaman berkas berhasil dibuat!");

      setShowPeminjamanForm(false);
      setSelectedArchive(null);

      // Trigger refresh untuk update status peminjaman di table
      triggerTableRefresh();

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error creating peminjaman:", error);

      // Log detailed error information for debugging
      console.log("Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      // Check if it's a 400 error with specific message about duplicate nomorSurat
      const isConflictError = error?.response?.status === 400;
      const errorMessage = error?.response?.data?.error || error?.message || "";
      const isDuplicateNomorSurat = errorMessage.includes(
        "Nomor surat peminjaman masih digunakan"
      );

      if (isConflictError && isDuplicateNomorSurat) {
        // Show custom modal for peminjaman conflict
        console.log("Showing peminjaman error modal");
        setPeminjamanErrorMessage(
          "Nomor surat ini masih digunakan untuk peminjaman yang belum dikembalikan. " +
            "Silakan gunakan nomor surat yang berbeda atau tunggu hingga peminjaman sebelumnya dikembalikan."
        );
        setShowPeminjamanErrorModal(true);
      } else {
        // Show generic error for other cases
        const fallbackMessage = "Terjadi kesalahan saat membuat peminjaman!";
        const displayMessage = errorMessage || fallbackMessage;
        alert(displayMessage);
      }
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

  // Debug modal state
  useEffect(() => {
    console.log("Peminjaman error modal state:", {
      showPeminjamanErrorModal,
      peminjamanErrorMessage,
    });
  }, [showPeminjamanErrorModal, peminjamanErrorMessage]);

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
          onPinjam={(archive) => handlePinjamArchive(archive)}
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
          refreshTrigger={tableRefreshTrigger}
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

      {/* Peminjaman Error Modal */}
      <PeminjamanErrorModal
        isOpen={showPeminjamanErrorModal}
        onClose={() => setShowPeminjamanErrorModal(false)}
        message={peminjamanErrorMessage}
      />
    </div>
  );
}
