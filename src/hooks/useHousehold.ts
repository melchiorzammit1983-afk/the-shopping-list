"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Household } from "@/types/household";

export function useHousehold() {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setHousehold(null);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("household_members")
      .select("household:households(id, name, created_at, created_by)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      const row = data as unknown as { household: Household };
      setHousehold(row.household);
    } else {
      setHousehold(null);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const createHousehold = useCallback(
    async (name: string) => {
      if (!user) return { error: "Not signed in" };
      const trimmed = name.trim();
      if (!trimmed) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("households")
        .insert({ name: trimmed, created_by: user.id });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [user, refresh]
  );

  const joinHousehold = useCallback(
    async (householdId: string) => {
      if (!user) return { error: "Not signed in" };
      const trimmed = householdId.trim();
      if (!trimmed) return { error: "Household ID is required" };
      const { error } = await getSupabaseClient()
        .from("household_members")
        .insert({ household_id: trimmed, user_id: user.id, role: "member" });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [user, refresh]
  );

  return { household, loaded, createHousehold, joinHousehold };
}
