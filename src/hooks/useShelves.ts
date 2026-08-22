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
    async (name: string) => {
      if (!roomId) return { error: "No room selected" };
      const trimmedName = name.trim();
      if (!trimmedName) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("shelves")
        .insert({ room_id: roomId, name: trimmedName });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [roomId, refresh]
  );

  return { shelves, loaded, createShelf };
}
