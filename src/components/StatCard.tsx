import { cn } from "@/lib/cn";
import Skeleton from "./Skeleton";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Secondary line under the value, e.g. a fiat estimate. */
  sublabel?: string;
  loading?: boolean;
  className?: string;
}

/** A single figure with its label, used in the dashboard summary row. */
export default function StatCard({
  label,
  value,
  sublabel,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-gray-800 rounded-xl px-4 py-3 flex flex-col gap-1", className)}>
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      {loading ? (
        <Skeleton className="w-20 h-6" />
      ) : (
        <span className="text-xl font-semibold">{value}</span>
      )}
      {sublabel && !loading && <span className="text-xs text-gray-500">{sublabel}</span>}
    </div>
  );
}
