"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toUserMessage } from "@/lib/errors";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-run the task, e.g. from a "Try again" button. */
  reload: () => void;
}

/**
 * Run an async task on mount and whenever `deps` change, tracking loading and
 * error state in one place.
 *
 * Results from a superseded run are discarded, so a slow response for an old
 * search term cannot overwrite a fast response for the current one. State is
 * also not written after unmount.
 */
export function useAsync<T>(
  task: () => Promise<T>,
  deps: unknown[] = [],
  options: { enabled?: boolean } = {}
): AsyncState<T> {
  const { enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Incremented per run; a result is only accepted if it belongs to the latest.
  const runId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const taskRef = useRef(task);
  taskRef.current = task;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const id = ++runId.current;
    setLoading(true);
    setError(null);

    taskRef
      .current()
      .then((result) => {
        if (id !== runId.current || !mounted.current) return;
        setData(result);
      })
      .catch((err: unknown) => {
        if (id !== runId.current || !mounted.current) return;
        setError(toUserMessage(err));
      })
      .finally(() => {
        if (id !== runId.current || !mounted.current) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload };
}
