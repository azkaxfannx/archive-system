"use client";

import React from "react";
import { X } from "lucide-react";

interface ExportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    fileName: string;
    totalRows: number;
  } | null;
}

export default function ExportResultModal({
  isOpen,
  onClose,
  result,
}: ExportResultModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Hasil Export</h2>

        <p className="mb-2">
          <strong>Nama file:</strong> {result.fileName}
        </p>
        <p className="mb-4">
          <strong>Total baris diexport:</strong> {result.totalRows}
        </p>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
