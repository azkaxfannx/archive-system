"use client";

import React from "react";
import { X } from "lucide-react";

interface ImportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    totalRows: number;
    successRows: number;
    failedRows: number;
    errors: { row: number; error: string }[];
  } | null;
}

export default function ImportResultModal({
  isOpen,
  onClose,
  result,
}: ImportResultModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Hasil Import</h2>

        <div className="space-y-2">
          <p>
            <strong>Total baris:</strong> {result.totalRows}
          </p>
          <p>
            <strong>Berhasil:</strong>{" "}
            <span className="text-green-600">{result.successRows}</span>
          </p>
          <p>
            <strong>Gagal:</strong>{" "}
            <span className="text-red-600">{result.failedRows}</span>
          </p>
        </div>

        {result.failedRows > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-red-600">Error Detail</h3>
            <ul className="mt-2 text-sm text-gray-700 max-h-40 overflow-y-auto">
              {result.errors.map((err, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">Row {err.row}:</span>{" "}
                  {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-right">
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
