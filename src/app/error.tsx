"use client";

import { useEffect } from "react";
import Button from "@/components/Button";

/**
 * Route-level error boundary. `ErrorBoundary` only catches render errors inside
 * a page; this catches anything that escapes a segment entirely, and offers a
 * retry that re-renders it rather than forcing a full reload.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console and in server logs via the digest.
    console.error("Route error:", error);
  }, [error]);

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <h2 className="text-3xl font-bold">Something went wrong</h2>
      <p className="text-gray-400 max-w-md">
        This page failed to load. Your wallet and funds are unaffected.
      </p>
      {error.digest && <p className="text-xs text-gray-600 font-mono">Ref: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
