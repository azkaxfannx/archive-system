"use client";

import React from "react";
import { X } from "lucide-react";
import { ArchiveRecord } from "@/types/archive";
import StatusBadge from "@/components/ui/StatusBadge";

interface ArchiveDetailModalProps {
  archive: ArchiveRecord;
  onClose: () => void;
}

export default function ArchiveDetailModal({
  archive,
  onClose,
}: ArchiveDetailModalProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Detail Arsip</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Identifikasi */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Identifikasi Dokumen
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Kode Unit
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {archive.kodeUnit || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Indeks
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {archive.indeks || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nomor Berkas
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {archive.nomorBerkas || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nomor Isi Berkas
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {archive.nomorIsiBerkas || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Judul Berkas
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {archive.judulBerkas || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Jenis Naskah Dinas
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {archive.jenisNaskahDinas || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="mt-1">
                  <StatusBadge status={archive.status} />
                </div>
              </div>
            </div>

            {/* Right Column - Detail Surat */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Detail Surat
              </h3>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nomor Surat
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {archive.nomorSurat || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Klasifikasi
                </label>
                <p className="mt-1 text-sm text-gray-900 break-all">
                  {archive.klasifikasi || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tanggal Surat
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(archive.tanggal || "")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tahun
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {archive.tanggal
                      ? new Date(archive.tanggal).getFullYear()
                      : "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tanggal Entry
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(archive.entryDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Full width sections */}
          <div className="mt-6 space-y-6">
            {/* Perihal */}
            <div>
              <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">
                Perihal
              </h3>
              <p className="text-sm text-gray-900 leading-relaxed">
                {archive.perihal || "-"}
              </p>
            </div>

            {/* Arsip Info & Retensi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Arsip Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Informasi Arsip
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tingkat Perkembangan
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {archive.tingkatPerkembangan || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Kondisi
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {archive.kondisi || "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Lokasi Simpan
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {archive.lokasiSimpan || "-"}
                  </p>
                </div>
              </div>

              {/* Retensi Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  Informasi Retensi
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Retensi Aktif
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {archive.retensiAktif || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Periode Retensi
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {archive.retentionYears} Tahun
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Retensi Inaktif
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {archive.retensiInaktif || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Keterangan */}
            {archive.keterangan && (
              <div>
                <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">
                  Keterangan
                </h3>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {archive.keterangan}
                </p>
              </div>
            )}

            {/* System Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Informasi Sistem
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Dibuat</label>
                  <p className="text-gray-900">
                    {formatDateTime(archive.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Terakhir Diperbarui
                  </label>
                  <p className="text-gray-900">
                    {formatDateTime(archive.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
