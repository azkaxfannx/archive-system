"use client";

import React, { useState } from "react";
import { X, BookOpen, Calendar } from "lucide-react";
import { ArchiveRecord, PeminjamanFormData } from "@/types/archive";

interface PeminjamanFormProps {
  archive: ArchiveRecord;
  onSave: (data: PeminjamanFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PeminjamanForm({
  archive,
  onSave,
  onCancel,
  loading = false,
}: PeminjamanFormProps) {
  // Calculate default dates
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const [formData, setFormData] = useState<PeminjamanFormData>({
    nomorSurat: archive.nomorSurat || "", // auto dari arsip
    peminjam: "",
    keperluan: "",
    tanggalPinjam: today.toISOString().split("T")[0],
    tanggalHarusKembali: oneWeekLater.toISOString().split("T")[0],
    archiveId: archive.id,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof PeminjamanFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate tanggal harus kembali when tanggal pinjam changes
      if (field === "tanggalPinjam" && value) {
        const pinjamDate = new Date(value);
        const kembaliDate = new Date(pinjamDate);
        kembaliDate.setDate(pinjamDate.getDate() + 7);
        newData.tanggalHarusKembali = kembaliDate.toISOString().split("T")[0];
      }

      return newData;
    });

    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.peminjam?.trim())
      newErrors.peminjam = "Nama Peminjam wajib diisi";
    if (!formData.keperluan?.trim())
      newErrors.keperluan = "Keperluan wajib diisi";
    if (!formData.tanggalPinjam)
      newErrors.tanggalPinjam = "Tanggal Pinjam wajib diisi";
    if (!formData.tanggalHarusKembali)
      newErrors.tanggalHarusKembali = "Tanggal Harus Kembali wajib diisi";

    // Validate dates
    if (formData.tanggalPinjam && formData.tanggalHarusKembali) {
      const pinjamDate = new Date(formData.tanggalPinjam);
      const kembaliDate = new Date(formData.tanggalHarusKembali);

      if (kembaliDate <= pinjamDate) {
        newErrors.tanggalHarusKembali =
          "Tanggal harus kembali harus setelah tanggal pinjam";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-orange-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Form Peminjaman Berkas
              </h2>
              <p className="text-sm text-gray-600">
                Pinjam berkas arsip untuk keperluan tertentu
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Archive Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Detail Berkas yang Dipinjam
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-blue-800">Nomor Berkas:</span>
                <span className="ml-2 text-blue-900">
                  {archive.nomorBerkas || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Nomor Surat:</span>
                <span className="ml-2 text-blue-900">
                  {archive.nomorSurat || "-"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-blue-800">Judul:</span>
                <span className="ml-2 text-blue-900">
                  {archive.judulBerkas || "-"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-blue-800">Perihal:</span>
                <span className="ml-2 text-blue-900">
                  {archive.perihal || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">
                  Tanggal Surat:
                </span>
                <span className="ml-2 text-blue-900">
                  {formatDate(archive.tanggal)}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Lokasi:</span>
                <span className="ml-2 text-blue-900">
                  {archive.lokasiSimpan || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Peminjaman Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Peminjam *
              </label>
              <input
                type="text"
                value={formData.peminjam}
                onChange={(e) => handleChange("peminjam", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.peminjam ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nama lengkap peminjam"
              />
              {errors.peminjam && (
                <p className="text-red-500 text-xs mt-1">{errors.peminjam}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keperluan *
              </label>
              <textarea
                value={formData.keperluan}
                onChange={(e) => handleChange("keperluan", e.target.value)}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.keperluan ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Jelaskan keperluan peminjaman berkas ini..."
              />
              {errors.keperluan && (
                <p className="text-red-500 text-xs mt-1">{errors.keperluan}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Tanggal Pinjam *
                </label>
                <input
                  type="date"
                  value={formData.tanggalPinjam}
                  onChange={(e) =>
                    handleChange("tanggalPinjam", e.target.value)
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.tanggalPinjam ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.tanggalPinjam && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tanggalPinjam}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Tanggal Harus Kembali *
                </label>
                <input
                  type="date"
                  value={formData.tanggalHarusKembali}
                  onChange={(e) =>
                    handleChange("tanggalHarusKembali", e.target.value)
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.tanggalHarusKembali
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.tanggalHarusKembali && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tanggalHarusKembali}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Default: 1 minggu dari tanggal pinjam
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Berkas harus dikembalikan sesuai
                jadwal yang ditentukan. Keterlambatan pengembalian dapat
                dikenakan sanksi sesuai kebijakan yang berlaku.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Pinjam Berkas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
