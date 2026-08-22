"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Room } from "@/types/room";

export function useRooms(locationId: string | null) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!locationId) {
      setRooms([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("rooms")
      .select("*")
      .eq("location_id", locationId)
      .order("created_at", { ascending: true });
    if (!error && data) setRooms(data);
  }, [locationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const createRoom = useCallback(
    async (name: string) => {
      if (!locationId) return { error: "No location selected" };
      const trimmedName = name.trim();
      if (!trimmedName) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("rooms")
        .insert({ location_id: locationId, name: trimmedName });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [locationId, refresh]
  );

  return { rooms, loaded, createRoom };
}
