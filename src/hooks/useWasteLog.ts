"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { WasteLogEntry } from "@/types/wasteLog";

export function useWasteLog(userId: string | null) {
  const [entries, setEntries] = useState<WasteLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("waste_log")
      .select("*, item:items(name)")
      .order("removed_at", { ascending: false });
    if (!error && data) setEntries(data as unknown as WasteLogEntry[]);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const logWaste = useCallback(
    async (
      itemId: string,
      quantity: number,
      unit: string | null,
      reason: string,
      removedBy: string,
      note: string | null = null
    ) => {
      const { error } = await getSupabaseClient().from("waste_log").insert({
        item_id: itemId,
        quantity,
        unit,
        reason,
        note,
        removed_by: removedBy,
      });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return { entries, loaded, logWaste };
}
