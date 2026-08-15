"use client";

import { useCallback, useEffect, useState } from "react";
import type { ShoppingItem } from "@/types/shopping-list";

const STORAGE_KEY = "shopping-list:items";

function loadItems(): ShoppingItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShoppingItem[]) : [];
  } catch {
    return [];
  }
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // localStorage isn't available during SSR, so items are hydrated from it
  // on mount rather than in the initial render (which would mismatch SSR output).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadItems());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((name: string, quantity: number) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        quantity,
        done: false,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.done));
  }, []);

  return { items, loaded, addItem, toggleItem, removeItem, clearDone };
}
