"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { InventoryItem, NewInventoryItem } from "@/types/inventory";

export function useInventory(householdId: string | null) {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!householdId) {
      setItems([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("inventory_items")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true });
    if (!error && data) setItems(data);
  }, [householdId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));

    if (!householdId) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`inventory_items_${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory_items",
          filter: `household_id=eq.${householdId}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, refresh]);

  const addItem = useCallback(
    async (newItem: NewInventoryItem) => {
      if (!householdId) return;
      await getSupabaseClient()
        .from("inventory_items")
        .insert({
          ...newItem,
          household_id: householdId,
          added_by: user?.id ?? null,
        });
    },
    [householdId, user]
  );

  const toggleItem = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      await getSupabaseClient()
        .from("inventory_items")
        .update({ done: !item.done })
        .eq("id", id);
    },
    [items]
  );

  const removeItem = useCallback(async (id: string) => {
    await getSupabaseClient().from("inventory_items").delete().eq("id", id);
  }, []);

  const clearDone = useCallback(async () => {
    if (!householdId) return;
    await getSupabaseClient()
      .from("inventory_items")
      .delete()
      .eq("household_id", householdId)
      .eq("done", true);
  }, [householdId]);

  return { items, loaded, addItem, toggleItem, removeItem, clearDone };
}
