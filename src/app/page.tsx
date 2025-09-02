"use client";

import { useSearchParams, useRouter } from "next/navigation";
import PeminjamanManagement from "@/components/peminjaman/PeminjamanManagement";
import ArchiveManagement from "@/components/archive/ArchiveManagement";
import "../app/globals.css";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = searchParams.get("tab") || "archive"; // default archive

  const setTab = (newTab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    router.push("?" + params.toString()); // update URL tanpa reload
  };

  return (
    <div className="p-6">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setTab("archive")}
          className={`px-3 py-1 rounded ${
            tab === "archive" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Arsip
        </button>
        <button
          onClick={() => setTab("peminjaman")}
          className={`px-3 py-1 rounded ${
            tab === "peminjaman" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Peminjaman
        </button>
      </div>

      {tab === "archive" ? <ArchiveManagement /> : <PeminjamanManagement />}
    </div>
  );
}
