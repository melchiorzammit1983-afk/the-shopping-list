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

  const renameRoom = useCallback(
    async (roomId: string, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("rooms")
        .update({ name: trimmedName })
        .eq("id", roomId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  const deleteRoom = useCallback(
    async (roomId: string) => {
      const { data: childShelves, error: countError } = await getSupabaseClient()
        .from("shelves")
        .select("id")
        .eq("room_id", roomId);
      if (countError) return { error: countError.message };
      if ((childShelves?.length ?? 0) > 0) {
        return {
          error: "This room has shelves in it — remove those first.",
        };
      }
      const { error } = await getSupabaseClient()
        .from("rooms")
        .delete()
        .eq("id", roomId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return { rooms, loaded, createRoom, renameRoom, deleteRoom };
}
