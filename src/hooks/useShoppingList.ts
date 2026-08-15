"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ShoppingItem } from "@/types/shopping-list";

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setItems(data);
  }, []);

  // Data lives in Supabase, not React state, so the initial load and every
  // realtime update both happen in effects rather than during render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));

    const channel = supabase
      .channel("shopping_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items" },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addItem = useCallback(async (name: string, quantity: number) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await supabase.from("shopping_items").insert({ name: trimmed, quantity });
  }, []);

  const toggleItem = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      await supabase
        .from("shopping_items")
        .update({ done: !item.done })
        .eq("id", id);
    },
    [items]
  );

  const removeItem = useCallback(async (id: string) => {
    await supabase.from("shopping_items").delete().eq("id", id);
  }, []);

  const clearDone = useCallback(async () => {
    await supabase.from("shopping_items").delete().eq("done", true);
  }, []);

  return { items, loaded, addItem, toggleItem, removeItem, clearDone };
}
