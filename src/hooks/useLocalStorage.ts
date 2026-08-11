"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * State backed by `localStorage`.
 *
 * The initial render always returns `initialValue` and the stored value is
 * adopted in an effect. Reading storage during render would make the server
 * and client markup disagree and trip a hydration mismatch, so the first paint
 * is deliberately the default.
 *
 * Storage access is wrapped because it throws in private browsing modes and
 * when a quota is exceeded; a failure degrades to in-memory state.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // Unreadable or corrupt entry — keep the default.
    }
  }, [key]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage is full or blocked; the value still lives in React state.
      }
    },
    [key]
  );

  const remove = useCallback(() => {
    setValue(initialValue);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing more to do if storage is unavailable.
    }
    // `initialValue` is intentionally not a dependency: callers commonly pass an
    // inline literal, which would otherwise rebuild this callback every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, set, remove];
}
