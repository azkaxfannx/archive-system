"use client";

import React, { useState } from "react";
import { Upload, X, Clock } from "lucide-react";
import { FILE_UPLOAD } from "@/utils/constants";

interface ImportModalProps {
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export default function ImportModal({ onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const validateFile = (file: File): boolean => {
    setError("");

    // Check file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      setError(
        `File terlalu besar. Maksimal ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`
      );
      return false;
    }

    // Check file type
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
    const fileExtension = ext ? "." + ext.toLowerCase() : "";
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(fileExtension as any)) {
      setError(
        `Format file tidak didukung. Gunakan: ${FILE_UPLOAD.ALLOWED_TYPES.join(
          ", "
        )}`
      );
      return false;
    }

    return true;
  };

  const handleImport = async () => {
    if (!file) return;

    if (!validateFile(file)) return;

    setImporting(true);
    try {
      await onImport(file);
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      setError("Terjadi kesalahan saat mengimpor file");
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Import Data Excel</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={importing}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {file
                  ? file.name
                  : "Drag & drop file Excel atau klik untuk memilih"}
              </p>
              <p className="text-xs text-gray-500">
                Format yang didukung: {FILE_UPLOAD.ALLOWED_TYPES.join(", ")}
                (maksimal {FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB)
              </p>
              <input
                type="file"
                accept={FILE_UPLOAD.ALLOWED_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Pilih File
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Format Excel yang diharapkan:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Header sesuai template sistem</li>
              <li>• Kolom KODE UNIT, NOMOR SURAT, PERIHAL (wajib)</li>
              <li>• Format tanggal: DD-MMM-YY atau YYYY-MM-DD</li>
              <li>• Maksimal 1000 baris per upload</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-6 border-t">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing || !!error}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengimpor...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
