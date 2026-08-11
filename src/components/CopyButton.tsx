"use client";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  /** The full value written to the clipboard. */
  value: string;
  /** What the button shows; defaults to the value itself. */
  children?: React.ReactNode;
  /** Describes the value for screen readers, e.g. "Stellar address". */
  label?: string;
  className?: string;
}

/**
 * Copies a value to the clipboard and confirms it in place. Addresses and
 * hashes are truncated everywhere they appear, so copying is the only reliable
 * way for a user to get the full string.
 */
export default function CopyButton({
  value,
  children,
  label = "value",
  className,
}: CopyButtonProps) {
  const { copied, copy, error } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={value}
      className={cn(
        "inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        error && "text-red-400",
        className
      )}
    >
      <span>{children ?? value}</span>
      <span aria-hidden="true" className="text-xs">
        {copied ? "✓" : "⧉"}
      </span>
    </button>
  );
}
