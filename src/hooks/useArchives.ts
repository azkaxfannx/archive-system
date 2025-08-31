import { useState, useEffect } from "react";
import {
  ArchiveRecord,
  ArchiveResponse,
  ArchiveParams,
  PaginationData,
} from "@/types/archive";
import { archiveAPI } from "@/services/archiveAPI";

interface UseArchivesResult {
  archives: ArchiveRecord[];
  pagination: PaginationData | null;
  loading: boolean;
  error: string | null;
  mutate: () => Promise<void>;
}

export function useArchives(params: ArchiveParams = {}): UseArchivesResult {
  const [data, setData] = useState<ArchiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await archiveAPI.getArchives(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching archives:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when params change
  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return {
    archives: data?.data || [],
    pagination: data?.pagination || null,
    loading,
    error,
    mutate: fetchData,
  };
}
