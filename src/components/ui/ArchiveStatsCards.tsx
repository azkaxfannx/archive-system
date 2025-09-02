import { FileText, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface StatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  disposeCount: number;
}

export default function ArchiveStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  disposeCount,
}: StatsCardsProps) {
  const stats = [
    {
      name: "Total Arsip",
      value: totalCount,
      icon: FileText,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      name: "Aktif",
      value: activeCount,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      name: "Inaktif",
      value: inactiveCount,
      icon: AlertCircle,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      name: "Siap Musnah",
      value: disposeCount,
      icon: XCircle,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <Icon className={stat.textColor} size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600">{stat.name}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
