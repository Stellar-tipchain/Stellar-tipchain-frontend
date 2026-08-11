import { cn } from "@/lib/cn";
import type { Severity } from "@/types";

const STYLES: Record<Severity, string> = {
  success: "bg-green-950 border-green-800 text-green-200",
  error: "bg-red-950 border-red-800 text-red-200",
  info: "bg-blue-950 border-blue-800 text-blue-200",
  warning: "bg-amber-950 border-amber-800 text-amber-200",
};

interface AlertProps {
  severity?: Severity;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * An inline message block. Unlike a toast this stays on the page, so it suits
 * persistent conditions such as a missing wallet or a misconfigured network.
 */
export default function Alert({ severity = "info", title, children, className }: AlertProps) {
  return (
    <div
      role={severity === "error" ? "alert" : "status"}
      className={cn("border rounded-xl px-4 py-3 text-sm", STYLES[severity], className)}
    >
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
