"use client";

import { FileText, Clock, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserType } from "@/types/archive";

interface HeaderProps {
  refreshTrigger?: number;
}

export default function Header({ refreshTrigger }: HeaderProps) {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();

  const fetchLastUpdate = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/archives/latest");
      if (response.ok) {
        const data = await response.json();
        if (data.lastEntryDate) {
          const date = new Date(data.lastEntryDate);
          const formattedDate = date.toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Jakarta",
          });
          setLastUpdate(formattedDate);
        } else {
          setLastUpdate("Belum ada data");
        }
      } else {
        setLastUpdate("Error loading");
      }
    } catch (error) {
      console.error("Failed to fetch last update:", error);
      setLastUpdate("Error loading");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      setUser(null);
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchLastUpdate();

    const interval = setInterval(fetchLastUpdate, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 text-blue-600" size={32} />
            Sistem Manajemen Arsip Surat
          </h1>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 flex items-center">
              <Clock size={16} className="mr-1" />
              <span>Data terakhir diinput:</span>
              <span
                className={`ml-2 font-medium ${
                  loading ? "text-gray-400" : "text-gray-800"
                }`}
              >
                {loading ? (
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-1"></div>
                    Loading...
                  </div>
                ) : (
                  lastUpdate || "Tidak ada data"
                )}
              </span>

              <button
                onClick={fetchLastUpdate}
                className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                title="Refresh data terakhir"
                disabled={loading}
              >
                <Clock
                  size={14}
                  className={
                    loading
                      ? "animate-spin"
                      : "hover:rotate-12 transition-transform"
                  }
                />
              </button>
            </div>

            {user && (
              <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                <div className="flex items-center space-x-2">
                  <User size={20} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || "Admin"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 px-2 py-1 rounded transition-colors group"
                  title="Logout"
                >
                  <LogOut size={16} className="group-hover:text-red-600" />
                  <span className="text-xs group-hover:text-red-600">
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
