// hooks/usePeriodFilters.ts
import { useState, useEffect, useCallback } from "react";
import {
  PeriodFilters,
  QuickFilterOption,
  isPeriodFilterActive,
  getPeriodFilterDescription,
  validatePeriodFilter,
} from "@/types/periodFilter";

interface UsePeriodFiltersProps {
  initialFilters?: Partial<PeriodFilters>;
  onFiltersChange?: (filters: PeriodFilters) => void;
  autoApplyDelay?: number;
}

export function usePeriodFilters({
  initialFilters = {},
  onFiltersChange,
  autoApplyDelay = 500,
}: UsePeriodFiltersProps = {}) {
  const [filters, setFilters] = useState<PeriodFilters>({
    startMonth: initialFilters.startMonth || "",
    endMonth: initialFilters.endMonth || "",
    year: initialFilters.year || "",
  });

  const [pendingFilters, setPendingFilters] = useState<PeriodFilters>(filters);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  // Generate quick filter options
  const generateQuickFilters = useCallback((): QuickFilterOption[] => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.floor((currentMonth - 1) / 3);

    return [
      {
        label: "Bulan Ini",
        description: "Arsip bulan berjalan",
        year: currentYear.toString(),
        startMonth: currentMonth.toString(),
        endMonth: currentMonth.toString(),
        icon: "📅",
        category: "current",
      },
      {
        label: "Bulan Lalu",
        description: "Arsip bulan sebelumnya",
        year:
          currentMonth === 1
            ? (currentYear - 1).toString()
            : currentYear.toString(),
        startMonth: currentMonth === 1 ? "12" : (currentMonth - 1).toString(),
        endMonth: currentMonth === 1 ? "12" : (currentMonth - 1).toString(),
        icon: "📄",
        category: "current",
      },
      {
        label: "Kuartal I",
        description: "Januari - Maret",
        year: currentYear.toString(),
        startMonth: "1",
        endMonth: "3",
        icon: "🌸",
        category: "quarterly",
      },
      {
        label: "Kuartal II",
        description: "April - Juni",
        year: currentYear.toString(),
        startMonth: "4",
        endMonth: "6",
        icon: "☀️",
        category: "quarterly",
      },
      {
        label: "Kuartal III",
        description: "Juli - September",
        year: currentYear.toString(),
        startMonth: "7",
        endMonth: "9",
        icon: "🍃",
        category: "quarterly",
      },
      {
        label: "Kuartal IV",
        description: "Oktober - Desember",
        year: currentYear.toString(),
        startMonth: "10",
        endMonth: "12",
        icon: "❄️",
        category: "quarterly",
      },
      {
        label: "Semester I",
        description: "Januari - Juni",
        year: currentYear.toString(),
        startMonth: "1",
        endMonth: "6",
        icon: "📊",
        category: "semester",
      },
      {
        label: "Semester II",
        description: "Juli - Desember",
        year: currentYear.toString(),
        startMonth: "7",
        endMonth: "12",
        icon: "📈",
        category: "semester",
      },
      {
        label: "Tahun Ini",
        description: "Seluruh tahun berjalan",
        year: currentYear.toString(),
        startMonth: "1",
        endMonth: "12",
        icon: "📆",
        category: "yearly",
      },
      {
        label: "Tahun Lalu",
        description: "Seluruh tahun sebelumnya",
        year: (currentYear - 1).toString(),
        startMonth: "1",
        endMonth: "12",
        icon: "📋",
        category: "yearly",
      },
    ];
  }, []);

  // Validate filters when they change
  useEffect(() => {
    const validation = validatePeriodFilter(pendingFilters);
    setValidationErrors(validation.errors);
  }, [pendingFilters]);

  // Auto-apply filters with delay
  useEffect(() => {
    if (autoApplyDelay > 0) {
      const timer = setTimeout(() => {
        if (validatePeriodFilter(pendingFilters).isValid) {
          setFilters(pendingFilters);
        }
      }, autoApplyDelay);

      return () => clearTimeout(timer);
    }
  }, [pendingFilters, autoApplyDelay]);

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = useCallback(
    (field: keyof PeriodFilters, value: string) => {
      setPendingFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const applyQuickFilter = useCallback((quickFilter: QuickFilterOption) => {
    const newFilters = {
      year: quickFilter.year,
      startMonth: quickFilter.startMonth,
      endMonth: quickFilter.endMonth,
    };

    setPendingFilters(newFilters);
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      year: "",
      startMonth: "",
      endMonth: "",
    };

    setPendingFilters(emptyFilters);
    setFilters(emptyFilters);
  }, []);

  const applyFilters = useCallback(() => {
    if (validatePeriodFilter(pendingFilters).isValid) {
      setIsApplying(true);
      setFilters(pendingFilters);
      setTimeout(() => setIsApplying(false), 100);
    }
  }, [pendingFilters]);

  const resetToApplied = useCallback(() => {
    setPendingFilters(filters);
  }, [filters]);

  const isQuickFilterActive = useCallback(
    (quickFilter: QuickFilterOption): boolean => {
      return (
        filters.year === quickFilter.year &&
        filters.startMonth === quickFilter.startMonth &&
        filters.endMonth === quickFilter.endMonth
      );
    },
    [filters]
  );

  const hasActiveFilters = isPeriodFilterActive(filters);
  const hasPendingChanges =
    JSON.stringify(filters) !== JSON.stringify(pendingFilters);
  const filterDescription = getPeriodFilterDescription(filters);
  const isValid = validationErrors.length === 0;

  return {
    // Current state
    filters,
    pendingFilters,
    hasActiveFilters,
    hasPendingChanges,
    isApplying,
    isValid,
    validationErrors,
    filterDescription,

    // Actions
    updateFilter,
    applyQuickFilter,
    clearFilters,
    applyFilters,
    resetToApplied,

    // Utilities
    generateQuickFilters,
    isQuickFilterActive,
  };
}
