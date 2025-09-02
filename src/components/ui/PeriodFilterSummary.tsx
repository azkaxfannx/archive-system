// components/ui/PeriodFilterSummary.tsx
import React from "react";
import { Calendar, X } from "lucide-react";

interface PeriodFilters {
  startMonth: string;
  endMonth: string;
  year: string;
}

interface PeriodFilterSummaryProps {
  periodFilters: PeriodFilters;
  onClear: () => void;
  totalRecords: number;
}

const MONTHS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function PeriodFilterSummary({
  periodFilters,
  onClear,
  totalRecords,
}: PeriodFilterSummaryProps) {
  const { year, startMonth, endMonth } = periodFilters;

  // Check if any period filter is active
  const hasActiveFilters = year || startMonth || endMonth;

  if (!hasActiveFilters) return null;

  // Generate filter description
  const getFilterDescription = () => {
    let description = "";

    if (year) {
      description += `Tahun ${year}`;
    }

    if (startMonth && endMonth) {
      const startMonthName = MONTHS.find((m) => m.value === startMonth)?.label;
      const endMonthName = MONTHS.find((m) => m.value === endMonth)?.label;

      if (startMonth === endMonth) {
        description += description
          ? ` - ${startMonthName}`
          : `Bulan ${startMonthName}`;
      } else {
        description += description
          ? ` (${startMonthName} - ${endMonthName})`
          : `${startMonthName} - ${endMonthName}`;
      }
    } else if (startMonth) {
      const startMonthName = MONTHS.find((m) => m.value === startMonth)?.label;
      description += description
        ? ` - Mulai ${startMonthName}`
        : `Mulai ${startMonthName}`;
    } else if (endMonth) {
      const endMonthName = MONTHS.find((m) => m.value === endMonth)?.label;
      description += description
        ? ` - Sampai ${endMonthName}`
        : `Sampai ${endMonthName}`;
    }

    return description;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Filter Periode Aktif
            </p>
            <p className="text-sm text-blue-600">
              {getFilterDescription()} • {totalRecords} arsip ditemukan
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex-shrink-0 p-1 rounded-full hover:bg-blue-100 transition-colors"
          title="Hapus Filter Periode"
        >
          <X className="h-4 w-4 text-blue-500 hover:text-blue-700" />
        </button>
      </div>
    </div>
  );
}
