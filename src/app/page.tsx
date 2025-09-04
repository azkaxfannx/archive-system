"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PeminjamanManagement from "@/components/peminjaman/PeminjamanManagement";
import ArchiveManagement from "@/components/archive/ArchiveManagement";
import "../app/globals.css";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Centralized auth check function
  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Check both token and API validation
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, redirecting to login");
        router.push("/login");
        return;
      }

      // Validate token with API
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setIsAuth(true);
        } else {
          throw new Error("Invalid user data");
        }
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      setIsAuth(false);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [router]);

  const tab = searchParams.get("tab") || "archive";

  const setTab = (newTab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    router.push("?" + params.toString());
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem("token");
      setIsAuth(false);
      router.push("/login");
    }
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuth) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
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
        {/* <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button> */}
      </div>

      {tab === "archive" ? <ArchiveManagement /> : <PeminjamanManagement />}
    </div>
  );
}
