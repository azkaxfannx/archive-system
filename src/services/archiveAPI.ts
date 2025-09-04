import {
  ArchiveRecord,
  ArchiveFormData,
  ArchiveResponse,
  ArchiveParams,
  ImportResult,
  PeminjamanFormData,
  PeminjamanRecord,
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

    const res = await fetch(`/api/archives?${searchParams}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch archives");
    return res.json();
  },

  // Create new archive
  async createArchive(data: ArchiveFormData): Promise<ArchiveRecord> {
    const res = await fetch("/api/archives", {
      method: "POST",
      credentials: "include",
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
      credentials: "include",
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
      credentials: "include",
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
      credentials: "include",
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
    const res = await fetch("/api/archives/export", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch all archives");
    return res.json();
  },

  // ========== PEMINJAMAN METHODS ==========

  // Create peminjaman
  async createPeminjaman(data: PeminjamanFormData): Promise<PeminjamanRecord> {
    const res = await fetch("/api/peminjaman", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create peminjaman");
    }

    return res.json();
  },

  // Get peminjaman by archive ID
  async getPeminjamanByArchive(archiveId: string): Promise<PeminjamanRecord[]> {
    const res = await fetch(`/api/peminjaman/archives/${archiveId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch peminjaman");
    return res.json();
  },

  // Get all peminjaman
  async getAllPeminjaman(): Promise<PeminjamanRecord[]> {
    const res = await fetch("/api/peminjaman", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch peminjaman");
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
  },

  // Get peminjaman with filters
  async getPeminjaman(
    params: Record<string, string | number> = {}
  ): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const res = await fetch(`/api/peminjaman?${searchParams}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch peminjaman");
    return res.json();
  },

  // Update peminjaman (untuk pengembalian)
  async updatePeminjaman(
    id: string,
    data: Partial<PeminjamanFormData>
  ): Promise<PeminjamanRecord> {
    const res = await fetch(`/api/peminjaman/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update peminjaman");
    return res.json();
  },

  // Delete peminjaman
  async deletePeminjaman(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/peminjaman/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to delete peminjaman");
    return res.json();
  },
};
