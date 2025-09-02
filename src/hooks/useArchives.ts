// hooks/useArchives.ts
import useSWR from "swr";
import { ArchiveRecord } from "@/types/archive";

interface UseArchivesParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  filters?: Record<string, string>;
  // New period filter parameters
  startMonth?: string;
  endMonth?: string;
  year?: string;
}

interface ArchiveResponse {
  data: ArchiveRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useArchives(params: UseArchivesParams) {
  const {
    page,
    limit,
    search = "",
    sort = "tanggal",
    order = "desc",
    status = "",
    filters = {},
    startMonth = "",
    endMonth = "",
    year = "",
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    sort,
    order,
    status,
  });

  // Add period filters if provided
  if (year) {
    queryParams.append("year", year);
  }
  if (startMonth) {
    queryParams.append("startMonth", startMonth);
  }
  if (endMonth) {
    queryParams.append("endMonth", endMonth);
  }

  // Add column filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(`filter[${key}]`, value);
    }
  });

  const url = `/api/archives?${queryParams.toString()}`;

  const { data, error, mutate, isValidating } = useSWR<ArchiveResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    archives: data?.data || [],
    pagination: data?.pagination || null,
    loading: !error && !data,
    error,
    mutate,
    isValidating,
  };
}
