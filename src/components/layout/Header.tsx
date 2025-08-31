import { FileText, Clock, User, LogOut } from "lucide-react";
import { User as UserType } from "@/types/archive";
import { useEffect, useState } from "react";

interface HeaderProps {
  user?: UserType;
  onLogout: () => void;
  refreshTrigger?: number; // Optional trigger untuk refresh external
}

export default function Header({
  user,
  onLogout,
  refreshTrigger,
}: HeaderProps) {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchLastUpdate();

    // Refresh setiap 30 detik untuk update realtime
    const interval = setInterval(fetchLastUpdate, 30000);

    return () => clearInterval(interval);
  }, [refreshTrigger]); // Re-fetch ketika refreshTrigger berubah

  // Removed the old onDataRefresh effect

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

              {/* Manual refresh button */}
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
              <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
                <User size={20} className="text-gray-500" />
                <span className="text-sm font-medium">
                  {user.name || "Admin"}
                </span>
                <button
                  onClick={onLogout}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
