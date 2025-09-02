// types/periodFilter.ts

export interface PeriodFilters {
  startMonth: string;
  endMonth: string;
  year: string;
}

export interface PeriodFilterParams {
  startMonth?: string;
  endMonth?: string;
  year?: string;
}

export interface MonthOption {
  value: string;
  label: string;
}

export interface QuickFilterOption {
  label: string;
  description: string;
  year: string;
  startMonth: string;
  endMonth: string;
  icon: string;
  category?: "current" | "quarterly" | "semester" | "yearly";
}

export interface PeriodFilterSummary {
  hasActiveFilters: boolean;
  description: string;
  filterCount: number;
}

// Utility functions for period filters
export const MONTHS: MonthOption[] = [
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

export const generateYearOptions = (
  startYear?: number,
  endYear?: number
): number[] => {
  const currentYear = new Date().getFullYear();
  const start = startYear || currentYear - 10;
  const end = endYear || currentYear + 2;

  const years: number[] = [];
  for (let year = end; year >= start; year--) {
    years.push(year);
  }
  return years;
};

export const getMonthName = (monthValue: string): string => {
  return MONTHS.find((m) => m.value === monthValue)?.label || "";
};

export const isPeriodFilterActive = (filters: PeriodFilters): boolean => {
  return !!(filters.year || filters.startMonth || filters.endMonth);
};

export const getPeriodFilterDescription = (filters: PeriodFilters): string => {
  let description = "";

  if (filters.year) {
    description += `Tahun ${filters.year}`;
  }

  if (filters.startMonth && filters.endMonth) {
    const startMonthName = getMonthName(filters.startMonth);
    const endMonthName = getMonthName(filters.endMonth);

    if (filters.startMonth === filters.endMonth) {
      description += description
        ? ` - ${startMonthName}`
        : `Bulan ${startMonthName}`;
    } else {
      description += description
        ? ` (${startMonthName} - ${endMonthName})`
        : `${startMonthName} - ${endMonthName}`;
    }
  } else if (filters.startMonth) {
    const startMonthName = getMonthName(filters.startMonth);
    description += description
      ? ` - Mulai ${startMonthName}`
      : `Mulai ${startMonthName}`;
  } else if (filters.endMonth) {
    const endMonthName = getMonthName(filters.endMonth);
    description += description
      ? ` - Sampai ${endMonthName}`
      : `Sampai ${endMonthName}`;
  }

  return description;
};

// Validation functions
export const validatePeriodFilter = (
  filters: PeriodFilters
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check if end month is after start month in the same year
  if (filters.startMonth && filters.endMonth) {
    const startMonth = parseInt(filters.startMonth);
    const endMonth = parseInt(filters.endMonth);

    if (startMonth > endMonth) {
      errors.push("Bulan akhir harus setelah atau sama dengan bulan awal");
    }
  }

  // Check year validity
  if (filters.year) {
    const year = parseInt(filters.year);
    const currentYear = new Date().getFullYear();

    if (year < 1900 || year > currentYear + 10) {
      errors.push("Tahun tidak valid");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
