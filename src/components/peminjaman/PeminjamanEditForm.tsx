"use client";

import React, { useState } from "react";
import { X, BookOpen, Calendar } from "lucide-react";
import { PeminjamanRecord, PeminjamanFormData } from "@/types/archive";

interface PeminjamanEditFormProps {
  item: PeminjamanRecord;
  onSave: (data: PeminjamanFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PeminjamanEditForm({
  item,
  onSave,
  onCancel,
  loading = false,
}: PeminjamanEditFormProps) {
  const [formData, setFormData] = useState<PeminjamanFormData>({
    nomorSurat: item.nomorSurat,
    peminjam: item.peminjam,
    keperluan: item.keperluan,
    tanggalPinjam: item.tanggalPinjam.split("T")[0],
    tanggalHarusKembali: item.tanggalHarusKembali.split("T")[0],
    archiveId: item.archiveId,
  });

  const handleChange = (field: keyof PeminjamanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-blue-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Edit Peminjaman</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Peminjam
            </label>
            <input
              type="text"
              value={formData.peminjam}
              onChange={(e) => handleChange("peminjam", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keperluan</label>
            <textarea
              value={formData.keperluan}
              onChange={(e) => handleChange("keperluan", e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Tanggal Pinjam
              </label>
              <input
                type="date"
                value={formData.tanggalPinjam}
                onChange={(e) => handleChange("tanggalPinjam", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Tanggal Harus Kembali
              </label>
              <input
                type="date"
                value={formData.tanggalHarusKembali}
                onChange={(e) =>
                  handleChange("tanggalHarusKembali", e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
