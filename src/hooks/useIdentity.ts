"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "identity:name";

export function useIdentity() {
  const [name, setName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // localStorage isn't available during SSR, so identity is hydrated from it
  // on mount rather than in the initial render (which would mismatch SSR output).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(window.localStorage.getItem(STORAGE_KEY));
    setLoaded(true);
  }, []);

  const setIdentity = useCallback((newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    window.localStorage.setItem(STORAGE_KEY, trimmed);
    setName(trimmed);
  }, []);

  const clearIdentity = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setName(null);
  }, []);

  return { name, loaded, setIdentity, clearIdentity };
}
