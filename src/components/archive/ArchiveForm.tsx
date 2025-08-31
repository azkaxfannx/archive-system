"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { ArchiveRecord, ArchiveFormData } from "@/types/archive";
import {
  JENIS_NASKAH_OPTIONS,
  TINGKAT_PERKEMBANGAN_OPTIONS,
  KONDISI_OPTIONS,
  RETENSI_AKTIF_OPTIONS,
  RETENSI_INAKTIF_OPTIONS,
} from "@/utils/constants";

// ✅ FIXED: Remove entryDate from form values - akan di-generate otomatis
export const DEFAULT_FORM_VALUES: ArchiveFormData = {
  kodeUnit: "",
  indeks: "",
  nomorBerkas: "",
  nomorIsiBerkas: "",
  judulBerkas: "",
  jenisNaskahDinas: JENIS_NASKAH_OPTIONS[0],
  nomorSurat: "",
  klasifikasi: "",
  perihal: "",
  tanggal: new Date().toISOString().split("T")[0], // yyyy-mm-dd
  // entryDate: REMOVED - akan di-set otomatis di backend
  tingkatPerkembangan: TINGKAT_PERKEMBANGAN_OPTIONS[0],
  kondisi: KONDISI_OPTIONS[0],
  lokasiSimpan: "",
  retensiAktif: RETENSI_AKTIF_OPTIONS[0],
  retensiInaktif: RETENSI_INAKTIF_OPTIONS[0],
  retentionYears: 2,
  status: "ACTIVE",
  keterangan: "",
};

interface ArchiveFormProps {
  archive?: ArchiveRecord;
  onSave: (data: ArchiveFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ArchiveForm({
  archive,
  onSave,
  onCancel,
  loading = false,
}: ArchiveFormProps) {
  const [formData, setFormData] = useState<ArchiveFormData>(
    archive
      ? {
          ...DEFAULT_FORM_VALUES,
          ...archive,
          jenisNaskahDinas:
            archive.jenisNaskahDinas || DEFAULT_FORM_VALUES.jenisNaskahDinas,
          lokasiSimpan:
            archive.lokasiSimpan || DEFAULT_FORM_VALUES.lokasiSimpan,
          // ✅ KEEP: Untuk edit, tetap tampilkan entryDate yang sudah ada (readonly)
        }
      : DEFAULT_FORM_VALUES
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ArchiveFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  function formatDateTimeLocal(dateString: string) {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16); // format yyyy-MM-ddTHH:mm
  }

  // ✅ FIXED: Remove entryDate validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.kodeUnit?.trim())
      newErrors.kodeUnit = "Kode Unit wajib diisi";
    if (!formData.nomorBerkas?.trim())
      newErrors.nomorBerkas = "Nomor Berkas wajib diisi";
    if (!formData.nomorSurat?.trim())
      newErrors.nomorSurat = "Nomor Surat wajib diisi";
    if (!formData.perihal?.trim()) newErrors.perihal = "Perihal wajib diisi";
    // REMOVED: entryDate validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      // ✅ Don't send entryDate for new records - backend will handle it
      const submitData = { ...formData };
      if (!archive) {
        // Untuk data baru, hapus entryDate agar backend yang generate
        delete submitData.entryDate;
      }
      await onSave(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {archive ? "Edit Arsip" : "Tambah Arsip Baru"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 - Identifikasi */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Identifikasi
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Unit *
                </label>
                <input
                  type="text"
                  value={formData.kodeUnit || ""}
                  onChange={(e) => handleChange("kodeUnit", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.kodeUnit ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: Pelabuhan Tanjung Intan"
                />
                {errors.kodeUnit && (
                  <p className="text-red-500 text-xs mt-1">{errors.kodeUnit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indeks
                </label>
                <input
                  type="text"
                  value={formData.indeks || ""}
                  onChange={(e) => handleChange("indeks", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: IND/SKTR/12/2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Berkas *
                </label>
                <input
                  type="text"
                  value={formData.nomorBerkas || ""}
                  onChange={(e) => handleChange("nomorBerkas", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nomorBerkas ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: 9"
                />
                {errors.nomorBerkas && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nomorBerkas}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Isi Berkas
                </label>
                <input
                  type="text"
                  value={formData.nomorIsiBerkas || ""}
                  onChange={(e) =>
                    handleChange("nomorIsiBerkas", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Berkas
                </label>
                <input
                  type="text"
                  value={formData.judulBerkas || ""}
                  onChange={(e) => handleChange("judulBerkas", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: PLN Cilacap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Naskah Dinas *
                </label>
                <select
                  value={formData.jenisNaskahDinas || JENIS_NASKAH_OPTIONS[0]}
                  onChange={(e) =>
                    handleChange("jenisNaskahDinas", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {JENIS_NASKAH_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Column 2 - Detail Surat */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Detail Surat
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Surat *
                </label>
                <input
                  type="text"
                  value={formData.nomorSurat || ""}
                  onChange={(e) => handleChange("nomorSurat", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nomorSurat ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: 0364/DIS.01.01/F03010000/2025"
                />
                {errors.nomorSurat && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nomorSurat}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klasifikasi
                </label>
                <input
                  type="text"
                  value={formData.klasifikasi || ""}
                  onChange={(e) => handleChange("klasifikasi", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: HM.01.02"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Surat
                </label>
                <input
                  type="date"
                  value={formData.tanggal || ""}
                  onChange={(e) => handleChange("tanggal", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* ✅ CONDITIONAL: Show entryDate only for edit mode (readonly) */}
              {archive && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Entry
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(archive.entryDate)}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                    title="Tanggal entry otomatis, tidak dapat diubah"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tanggal entry otomatis saat data disimpan
                  </p>
                </div>
              )}

              {/* ✅ INFO: For new records, show info about auto entry date */}
              {!archive && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Info:</strong> Tanggal entry akan otomatis
                    tercatat saat data disimpan
                  </p>
                </div>
              )}
            </div>

            {/* Column 3 - Arsip & Retensi */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Arsip & Retensi
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tingkat Perkembangan
                </label>
                <select
                  value={
                    formData.tingkatPerkembangan ||
                    TINGKAT_PERKEMBANGAN_OPTIONS[0]
                  }
                  onChange={(e) =>
                    handleChange("tingkatPerkembangan", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TINGKAT_PERKEMBANGAN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kondisi
                </label>
                <select
                  value={formData.kondisi || KONDISI_OPTIONS[0]}
                  onChange={(e) => handleChange("kondisi", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {KONDISI_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Simpan
                </label>
                <input
                  type="text"
                  value={formData.lokasiSimpan || ""}
                  onChange={(e) => handleChange("lokasiSimpan", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Divisi Pendukung Operasi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retensi Aktif
                </label>
                <select
                  value={formData.retensiAktif || RETENSI_AKTIF_OPTIONS[0]}
                  onChange={(e) => handleChange("retensiAktif", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {RETENSI_AKTIF_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode Retensi (Tahun)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.retentionYears || 2}
                  onChange={(e) =>
                    handleChange("retentionYears", parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retensi Inaktif
                </label>
                <select
                  value={formData.retensiInaktif || RETENSI_INAKTIF_OPTIONS[0]}
                  onChange={(e) =>
                    handleChange("retensiInaktif", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {RETENSI_INAKTIF_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Full width */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perihal *
              </label>
              <textarea
                value={formData.perihal || ""}
                onChange={(e) => handleChange("perihal", e.target.value)}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.perihal ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Contoh: Undangan verifikasi lapangan rencana pembangunan SBNP untuk saluran kabel bawah laut (SKBL) 20KV"
              />
              {errors.perihal && (
                <p className="text-red-500 text-xs mt-1">{errors.perihal}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                value={formData.keterangan || ""}
                onChange={(e) => handleChange("keterangan", e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {archive ? "Memperbarui..." : "Menyimpan..."}
                </>
              ) : archive ? (
                "Perbarui"
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
