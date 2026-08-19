"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { LocationItemWithDetails } from "@/types/locationItem";

export function useLocationStock(locationId: string | null) {
  const [stock, setStock] = useState<LocationItemWithDetails[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!locationId) {
      setStock([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("location_items")
      .select("*, item:items(*)")
      .eq("location_id", locationId)
      .order("created_at", { ascending: true });
    if (!error && data) setStock(data as unknown as LocationItemWithDetails[]);
  }, [locationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const addStock = useCallback(
    async (itemId: string, quantity: number) => {
      if (!locationId) return { error: "No location selected" };
      const existing = stock.find((row) => row.item_id === itemId);
      if (existing) {
        const { error } = await getSupabaseClient()
          .from("location_items")
          .update({
            quantity: existing.quantity + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) return { error: error.message };
      } else {
        const { error } = await getSupabaseClient()
          .from("location_items")
          .insert({
            location_id: locationId,
            item_id: itemId,
            quantity,
          });
        if (error) return { error: error.message };
      }
      await refresh();
      return { error: null };
    },
    [locationId, stock, refresh]
  );

  const adjustQuantity = useCallback(
    async (stockId: string, delta: number) => {
      const existing = stock.find((row) => row.id === stockId);
      if (!existing) return { error: "Item not found" };
      const nextQuantity = Math.max(0, existing.quantity + delta);
      const { error } = await getSupabaseClient()
        .from("location_items")
        .update({
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stockId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [stock, refresh]
  );

  return { stock, loaded, addStock, adjustQuantity };
}
