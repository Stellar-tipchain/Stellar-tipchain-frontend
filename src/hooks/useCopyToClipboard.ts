"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CopyState {
  copied: boolean;
  error: string | null;
  copy: (value: string) => Promise<boolean>;
}

/**
 * Copy text to the clipboard and flag success for a moment afterwards.
 *
 * The Clipboard API is unavailable on insecure origins and in some embedded
 * browsers, so failure is reported rather than thrown — the caller shows the
 * value instead of pretending the copy worked.
 */
export function useCopyToClipboard(resetAfterMs = 2000): CopyState {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Clear a pending reset if the component unmounts first.
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (value: string) => {
      clearTimeout(timer.current);
      try {
        if (!navigator?.clipboard?.writeText) {
          throw new Error("Clipboard is unavailable in this browser");
        }
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setError(null);
        timer.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch (e) {
        setCopied(false);
        setError(e instanceof Error ? e.message : "Could not copy");
        return false;
      }
    },
    [resetAfterMs]
  );

  return { copied, error, copy };
}
