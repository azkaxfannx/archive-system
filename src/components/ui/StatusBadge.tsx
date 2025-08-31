import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { STATUS_CONFIG } from "@/utils/constants";

interface StatusBadgeProps {
  status: "ACTIVE" | "INACTIVE" | "DISPOSE_ELIGIBLE";
  className?: string;
}

const iconMap = {
  ACTIVE: CheckCircle,
  INACTIVE: AlertCircle,
  DISPOSE_ELIGIBLE: XCircle,
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = iconMap[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}
    >
      <Icon size={12} className="mr-1" />
      {config.text}
    </span>
  );
}
