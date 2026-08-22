"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { StockEntryWithItem } from "@/types/stockEntry";

export function useStockEntries(shelfId: string | null) {
  const [entries, setEntries] = useState<StockEntryWithItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!shelfId) {
      setEntries([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("stock_entries")
      .select("*, item:items(*)")
      .eq("shelf_id", shelfId)
      .order("created_at", { ascending: true });
    if (!error && data)
      setEntries(data as unknown as StockEntryWithItem[]);
  }, [shelfId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const addStock = useCallback(
    async (itemId: string, quantity: number, unit: string) => {
      if (!shelfId) return { error: "No shelf selected" };
      const existing = entries.find((row) => row.item_id === itemId);
      if (existing) {
        const { error } = await getSupabaseClient()
          .from("stock_entries")
          .update({
            quantity: existing.quantity + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) return { error: error.message };
      } else {
        const { error } = await getSupabaseClient()
          .from("stock_entries")
          .insert({
            shelf_id: shelfId,
            item_id: itemId,
            quantity,
            unit: unit.trim() || null,
          });
        if (error) return { error: error.message };
      }
      await refresh();
      return { error: null };
    },
    [shelfId, entries, refresh]
  );

  const adjustQuantity = useCallback(
    async (entryId: string, delta: number) => {
      const existing = entries.find((row) => row.id === entryId);
      if (!existing) return { error: "Item not found" };
      const nextQuantity = Math.max(0, existing.quantity + delta);
      const { error } = await getSupabaseClient()
        .from("stock_entries")
        .update({
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [entries, refresh]
  );

  const setQuantity = useCallback(
    async (entryId: string, quantity: number, unit: string) => {
      const { error } = await getSupabaseClient()
        .from("stock_entries")
        .update({
          quantity,
          unit: unit.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  const removeEntry = useCallback(
    async (entryId: string) => {
      const { error } = await getSupabaseClient()
        .from("stock_entries")
        .delete()
        .eq("id", entryId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return {
    entries,
    loaded,
    addStock,
    adjustQuantity,
    setQuantity,
    removeEntry,
  };
}
