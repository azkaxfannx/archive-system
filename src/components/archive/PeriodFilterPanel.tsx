// components/archive/PeriodFilterPanel.tsx
import React, { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Filter,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  PeriodFilters,
  MONTHS,
  generateYearOptions,
  QuickFilterOption,
} from "@/types/periodFilter";
import { usePeriodFilters } from "@/hooks/usePeriodFilters";

interface PeriodFilterPanelProps {
  initialFilters: PeriodFilters;
  onFiltersChange: (field: keyof PeriodFilters, value: string) => void;
  totalRecords: number;
  className?: string;
}

export default function PeriodFilterPanel({
  initialFilters,
  onFiltersChange,
  totalRecords,
  className = "",
}: PeriodFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick" | "manual">("quick");

  const {
    filters,
    pendingFilters,
    hasActiveFilters,
    hasPendingChanges,
    isValid,
    validationErrors,
    filterDescription,
    updateFilter,
    applyQuickFilter,
    clearFilters,
    applyFilters,
    resetToApplied,
    generateQuickFilters,
    isQuickFilterActive,
  } = usePeriodFilters({
    initialFilters,
    onFiltersChange: (newFilters) => {
      // Propagate changes to parent component
      Object.entries(newFilters).forEach(([key, value]) => {
        onFiltersChange(key as keyof PeriodFilters, value);
      });
    },
  });

  const quickFilters = generateQuickFilters();
  const years = generateYearOptions();

  const handleQuickFilterClick = (quickFilter: QuickFilterOption) => {
    applyQuickFilter(quickFilter);
  };

  const groupedQuickFilters = {
    current: quickFilters.filter((f) => f.category === "current"),
    quarterly: quickFilters.filter((f) => f.category === "quarterly"),
    semester: quickFilters.filter((f) => f.category === "semester"),
    yearly: quickFilters.filter((f) => f.category === "yearly"),
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Filter Periode
            </h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Aktif
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-800 underline flex items-center"
              >
                <X className="h-3 w-3 mr-1" />
                Hapus
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">
                  {filterDescription}
                </span>
              </div>
              <span className="text-xs text-blue-600">
                {totalRecords} arsip ditemukan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("quick")}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "quick"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="h-4 w-4 mr-1" />
              Filter Cepat
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "manual"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter Manual
            </button>
          </div>

          {/* Quick Filters Tab */}
          {activeTab === "quick" && (
            <div className="space-y-4">
              {Object.entries(groupedQuickFilters).map(
                ([category, filters]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      {category === "current" && "Periode Terkini"}
                      {category === "quarterly" && "Kuartal"}
                      {category === "semester" && "Semester"}
                      {category === "yearly" && "Tahunan"}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {filters.map((filter, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickFilterClick(filter)}
                          className={`p-3 text-left border-2 rounded-lg transition-all ${
                            isQuickFilterActive(filter)
                              ? "border-blue-500 bg-blue-50 text-blue-900"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-base">{filter.icon}</span>
                            <span className="text-sm font-medium">
                              {filter.label}
                            </span>
                            {isQuickFilterActive(filter) && (
                              <Check className="h-4 w-4 text-blue-600 ml-auto" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {filter.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Manual Filters Tab */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              {/* Validation Errors */}
              {!isValid && validationErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Terdapat kesalahan:
                    </span>
                  </div>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Manual Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun
                  </label>
                  <select
                    value={pendingFilters.year}
                    onChange={(e) => updateFilter("year", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Tahun</option>
                    {years.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dari Bulan
                  </label>
                  <select
                    value={pendingFilters.startMonth}
                    onChange={(e) => updateFilter("startMonth", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Bulan</option>
                    {MONTHS.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* End Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sampai Bulan
                  </label>
                  <select
                    value={pendingFilters.endMonth}
                    onChange={(e) => updateFilter("endMonth", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Bulan</option>
                    {MONTHS.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              {hasPendingChanges && (
                <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={applyFilters}
                    disabled={!isValid}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isValid
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Terapkan Filter
                  </button>
                  <button
                    onClick={resetToApplied}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
