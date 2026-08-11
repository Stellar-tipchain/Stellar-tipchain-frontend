"use client";

import { useEffect, useState } from "react";

/**
 * A value that only updates once it has stopped changing for `delay` ms.
 *
 * Used by the explore search box so filtering — and, later, a server-side
 * search request — does not fire on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
