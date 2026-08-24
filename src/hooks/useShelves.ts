"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Shelf } from "@/types/shelf";

export function useShelves(roomId: string | null) {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!roomId) {
      setShelves([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("shelves")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });
    if (!error && data) setShelves(data);
  }, [roomId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const createShelf = useCallback(
    async (name: string, type: string | null = null) => {
      if (!roomId) return { error: "No room selected" };
      const trimmedName = name.trim();
      if (!trimmedName) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("shelves")
        .insert({ room_id: roomId, name: trimmedName, type });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [roomId, refresh]
  );

  const setShelfType = useCallback(
    async (shelfId: string, type: string | null) => {
      const { error } = await getSupabaseClient()
        .from("shelves")
        .update({ type })
        .eq("id", shelfId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  const renameShelf = useCallback(
    async (shelfId: string, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("shelves")
        .update({ name: trimmedName })
        .eq("id", shelfId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  const deleteShelf = useCallback(
    async (shelfId: string) => {
      const { data: childEntries, error: countError } = await getSupabaseClient()
        .from("stock_entries")
        .select("id")
        .eq("shelf_id", shelfId);
      if (countError) return { error: countError.message };
      if ((childEntries?.length ?? 0) > 0) {
        return {
          error: "This shelf has items on it — remove those first.",
        };
      }
      const { error } = await getSupabaseClient()
        .from("shelves")
        .delete()
        .eq("id", shelfId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  // Logs every stock entry on this shelf to the waste log under one reason,
  // then clears them so the shelf can actually be deleted afterward.
  const emptyShelf = useCallback(
    async (shelfId: string, reason: string, removedBy: string) => {
      const { data: shelfEntries, error: fetchError } =
        await getSupabaseClient()
          .from("stock_entries")
          .select("item_id, quantity, unit")
          .eq("shelf_id", shelfId);
      if (fetchError) return { error: fetchError.message };
      if (shelfEntries && shelfEntries.length > 0) {
        const { error: logError } = await getSupabaseClient()
          .from("waste_log")
          .insert(
            shelfEntries.map((entry) => ({
              item_id: entry.item_id,
              quantity: entry.quantity,
              unit: entry.unit,
              reason,
              removed_by: removedBy,
            }))
          );
        if (logError) return { error: logError.message };
        const { error: deleteError } = await getSupabaseClient()
          .from("stock_entries")
          .delete()
          .eq("shelf_id", shelfId);
        if (deleteError) return { error: deleteError.message };
      }
      return { error: null };
    },
    []
  );

  return {
    shelves,
    loaded,
    createShelf,
    renameShelf,
    deleteShelf,
    emptyShelf,
    setShelfType,
  };
}
