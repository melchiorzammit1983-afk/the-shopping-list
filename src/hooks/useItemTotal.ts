"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { summarizeQuantities } from "@/lib/units";
import type { UnitTotal } from "@/lib/units";

export type ItemStockBreakdownRow = {
  entryId: string;
  quantity: number;
  unit: string | null;
  shelfName: string;
  roomName: string;
  locationName: string;
};

export function useItemTotal(itemId: string | null) {
  const [breakdown, setBreakdown] = useState<ItemStockBreakdownRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!itemId) {
      setBreakdown([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("stock_entries")
      .select(
        "id, quantity, unit, shelf:shelves(name, room:rooms(name, location:locations(name)))"
      )
      .eq("item_id", itemId);
    if (!error && data) {
      type Row = {
        id: string;
        quantity: number;
        unit: string | null;
        shelf: {
          name: string;
          room: { name: string; location: { name: string } };
        };
      };
      setBreakdown(
        (data as unknown as Row[]).map((row) => ({
          entryId: row.id,
          quantity: row.quantity,
          unit: row.unit,
          shelfName: row.shelf.name,
          roomName: row.shelf.room.name,
          locationName: row.shelf.room.location.name,
        }))
      );
    }
  }, [itemId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const totals: UnitTotal[] = summarizeQuantities(
    breakdown.map((row) => ({ quantity: row.quantity, unit: row.unit }))
  );

  return { breakdown, totals, loaded };
}
