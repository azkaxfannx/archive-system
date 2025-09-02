// components/archive/QuickPeriodFilters.tsx
import React from "react";
import { Clock, Calendar } from "lucide-react";

interface PeriodFilters {
  startMonth: string;
  endMonth: string;
  year: string;
}

interface QuickPeriodFiltersProps {
  onPeriodFilterChange: (field: keyof PeriodFilters, value: string) => void;
  currentFilters: PeriodFilters;
}

interface QuickFilter {
  label: string;
  description: string;
  year: string;
  startMonth: string;
  endMonth: string;
  icon?: string;
}

export default function QuickPeriodFilters({
  onPeriodFilterChange,
  currentFilters,
}: QuickPeriodFiltersProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Define quick filter options
  const quickFilters: QuickFilter[] = [
    {
      label: "Bulan Ini",
      description: "Arsip bulan berjalan",
      year: currentYear.toString(),
      startMonth: currentMonth.toString(),
      endMonth: currentMonth.toString(),
      icon: "📅",
    },
    {
      label: "Kuartal Ini",
      description: "Arsip 3 bulan terakhir",
      year: currentYear.toString(),
      startMonth: (Math.floor((currentMonth - 1) / 3) * 3 + 1).toString(),
      endMonth: (Math.floor((currentMonth - 1) / 3) * 3 + 3).toString(),
      icon: "📊",
    },
    {
      label: "Semester I",
      description: "Januari - Juni",
      year: currentYear.toString(),
      startMonth: "1",
      endMonth: "6",
      icon: "🌸",
    },
    {
      label: "Semester II",
      description: "Juli - Desember",
      year: currentYear.toString(),
      startMonth: "7",
      endMonth: "12",
      icon: "🍂",
    },
    {
      label: "Tahun Ini",
      description: "Seluruh tahun berjalan",
      year: currentYear.toString(),
      startMonth: "1",
      endMonth: "12",
      icon: "📆",
    },
    {
      label: "Tahun Lalu",
      description: "Seluruh tahun sebelumnya",
      year: (currentYear - 1).toString(),
      startMonth: "1",
      endMonth: "12",
      icon: "📋",
    },
  ];

  const applyQuickFilter = (filter: QuickFilter) => {
    onPeriodFilterChange("year", filter.year);
    onPeriodFilterChange("startMonth", filter.startMonth);
    onPeriodFilterChange("endMonth", filter.endMonth);
  };

  const clearFilters = () => {
    onPeriodFilterChange("year", "");
    onPeriodFilterChange("startMonth", "");
    onPeriodFilterChange("endMonth", "");
  };

  // Check if a quick filter is currently active
  const isFilterActive = (filter: QuickFilter) => {
    return (
      currentFilters.year === filter.year &&
      currentFilters.startMonth === filter.startMonth &&
      currentFilters.endMonth === filter.endMonth
    );
  };

  const hasActiveFilters =
    currentFilters.year || currentFilters.startMonth || currentFilters.endMonth;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Filter Periode Cepat
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Hapus Semua
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {quickFilters.map((filter, index) => (
          <button
            key={index}
            onClick={() => applyQuickFilter(filter)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
              isFilterActive(filter)
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{filter.icon}</span>
              <span className="text-sm font-semibold">{filter.label}</span>
            </div>
            <p className="text-xs text-gray-500">{filter.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Klik salah satu opsi di atas untuk menerapkan filter periode, atau
          gunakan filter manual untuk pengaturan yang lebih spesifik.
        </p>
      </div>
    </div>
  );
}
