"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Household } from "@/types/household";

const STORAGE_KEY = "household:current_id";

export function useHousehold(identityName: string | null) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadById = useCallback(async (id: string) => {
    const { data, error } = await getSupabaseClient()
      .from("households")
      .select("id, name, created_at, created_by_name")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) {
      setHousehold(data);
      return true;
    }
    return false;
  }, []);

  // localStorage isn't available during SSR, so the stored household ID is
  // read and resolved on mount rather than in the initial render.
  useEffect(() => {
    const storedId = window.localStorage.getItem(STORAGE_KEY);
    if (!storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true);
      return;
    }
    loadById(storedId).then((found) => {
      if (!found) window.localStorage.removeItem(STORAGE_KEY);
      setLoaded(true);
    });
  }, [loadById]);

  const createHousehold = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return { error: "Name is required" };
      const { data, error } = await getSupabaseClient()
        .from("households")
        .insert({ name: trimmed, created_by_name: identityName })
        .select("id, name, created_at, created_by_name")
        .single();
      if (error || !data) return { error: error?.message ?? "Couldn't create household" };
      window.localStorage.setItem(STORAGE_KEY, data.id);
      setHousehold(data);
      return { error: null };
    },
    [identityName]
  );

  const joinHousehold = useCallback(
    async (householdId: string) => {
      const trimmed = householdId.trim();
      if (!trimmed) return { error: "Household ID is required" };
      const found = await loadById(trimmed);
      if (!found) return { error: "No household found with that ID" };
      window.localStorage.setItem(STORAGE_KEY, trimmed);
      return { error: null };
    },
    [loadById]
  );

  const leaveHousehold = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setHousehold(null);
  }, []);

  return { household, loaded, createHousehold, joinHousehold, leaveHousehold };
}
