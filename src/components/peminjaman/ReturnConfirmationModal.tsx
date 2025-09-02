"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReturnConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  peminjam?: string;
  judulBerkas?: string;
}

export default function ReturnConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  peminjam,
  judulBerkas,
}: ReturnConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative bg-white shadow-xl rounded-2xl p-5 max-w-sm w-full mx-4"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Konfirmasi Pengembalian
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Apakah Anda yakin ingin mengembalikan berkas{" "}
              <span className="font-medium">{judulBerkas}</span> yang dipinjam
              oleh <span className="font-medium">{peminjam}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
              >
                {loading ? "Memproses..." : "Kembalikan"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
