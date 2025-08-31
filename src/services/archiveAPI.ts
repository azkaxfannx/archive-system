import {
  ArchiveRecord,
  ArchiveFormData,
  ArchiveResponse,
  ArchiveParams,
  ImportResult,
} from "@/types/archive";

export const archiveAPI = {
  // Get archives with filters
  async getArchives(params: ArchiveParams = {}): Promise<ArchiveResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.order) searchParams.append("order", params.order);

    // Add column filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) searchParams.append(`filter[${key}]`, value);
      });
    }

    const res = await fetch(`/api/archives?${searchParams}`);
    if (!res.ok) throw new Error("Failed to fetch archives");
    return res.json();
  },

  // Create new archive
  async createArchive(data: ArchiveFormData): Promise<ArchiveRecord> {
    const res = await fetch("/api/archives", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create archive");
    return res.json();
  },

  // Update archive
  async updateArchive(
    id: string,
    data: ArchiveFormData
  ): Promise<ArchiveRecord> {
    const res = await fetch(`/api/archives/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update archive");
    return res.json();
  },

  // Delete archive
  async deleteArchive(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/archives/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete archive");
    return res.json();
  },

  // Import from Excel
  async importExcel(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/archives/import", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Gagal mengimpor file");
    }

    return res.json();
  },

  // Get all archives (for export)
  async getAllArchives(): Promise<ArchiveRecord[]> {
    const res = await fetch("/api/archives/export");
    if (!res.ok) throw new Error("Failed to fetch all archives");
    return res.json();
  },
};
