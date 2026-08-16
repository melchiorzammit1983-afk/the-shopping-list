"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Location } from "@/types/location";

export function useLocations(userId: string | null) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLocations([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("locations")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setLocations(data);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const createLocation = useCallback(
    async (name: string, type: string) => {
      if (!userId) return { error: "Not signed in" };
      const trimmedName = name.trim();
      if (!trimmedName) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("locations")
        .insert({
          name: trimmedName,
          type: type.trim() || null,
          owner_id: userId,
        });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [userId, refresh]
  );

  return { locations, loaded, createLocation };
}
