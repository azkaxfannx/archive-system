"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
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

          {/* Floating alert box */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative bg-white shadow-xl rounded-2xl p-5 max-w-sm w-full mx-4"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Konfirmasi Hapus
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Apakah Anda yakin ingin menghapus arsip ini? <br />
              <span className="text-red-500 font-medium">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
