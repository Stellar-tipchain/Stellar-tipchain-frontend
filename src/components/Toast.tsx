"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div role="alert" aria-live="assertive" aria-atomic="true">
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg ${colors[type]}`}
      >
        <span className="text-sm">{message}</span>
        <button onClick={onClose} aria-label="Close notification" className="text-white/70 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
