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

  // Logs every stock entry across every shelf in this room to the waste
  // log, then clears the entries and the (now-empty) shelves so the room
  // can actually be deleted afterward.
  const emptyRoom = useCallback(
    async (roomId: string, reason: string, removedBy: string) => {
      const { data: roomShelves, error: shelvesError } =
        await getSupabaseClient()
          .from("shelves")
          .select("id")
          .eq("room_id", roomId);
      if (shelvesError) return { error: shelvesError.message };
      const shelfIds = (roomShelves ?? []).map((s) => s.id);
      if (shelfIds.length === 0) return { error: null };

      const { data: roomEntries, error: fetchError } =
        await getSupabaseClient()
          .from("stock_entries")
          .select("item_id, quantity, unit")
          .in("shelf_id", shelfIds);
      if (fetchError) return { error: fetchError.message };

      if (roomEntries && roomEntries.length > 0) {
        const { error: logError } = await getSupabaseClient()
          .from("waste_log")
          .insert(
            roomEntries.map((entry) => ({
              item_id: entry.item_id,
              quantity: entry.quantity,
              unit: entry.unit,
              reason,
              removed_by: removedBy,
            }))
          );
        if (logError) return { error: logError.message };
        const { error: deleteEntriesError } = await getSupabaseClient()
          .from("stock_entries")
          .delete()
          .in("shelf_id", shelfIds);
        if (deleteEntriesError) return { error: deleteEntriesError.message };
      }

      const { error: deleteShelvesError } = await getSupabaseClient()
        .from("shelves")
        .delete()
        .eq("room_id", roomId);
      if (deleteShelvesError) return { error: deleteShelvesError.message };

      return { error: null };
    },
    []
  );

  return { rooms, loaded, createRoom, renameRoom, deleteRoom, emptyRoom };
}
