"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { TOAST_DURATION_MS } from "@/constants";
import { cn } from "@/lib/cn";
import type { Severity } from "@/types";

interface ToastItem {
  id: number;
  message: string;
  severity: Severity;
}

interface ToastApi {
  toast: (message: string, severity?: Severity) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const COLORS: Record<Severity, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
  warning: "bg-amber-600",
};

/**
 * Application-wide toast queue.
 *
 * Previously each page owned a single `toast` state value, so a second message
 * replaced the first before it could be read. Hoisting the queue here lets
 * messages stack, and lets any component raise one without threading a setter
 * down through props.
 */
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, severity: Severity = "info") => {
      const id = nextId.current++;
      setItems((current) => [...current, { id, message, severity }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      dismiss,
      success: (message: string) => toast(message, "success"),
      error: (message: string) => toast(message, "error"),
    }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="assertive"
        aria-atomic="false"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="alert"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg",
              COLORS[item.severity]
            )}
          >
            <span className="text-sm">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Close notification"
              className="text-white/70 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Raise toasts from any client component below `ToastProvider`. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider");
  return context;
}
