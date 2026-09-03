"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { ShoppingList } from "@/types/shoppingList";

export function useShoppingLists(userId: string | null) {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setShoppingLists([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("shopping_lists")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setShoppingLists(data as ShoppingList[]);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const createShoppingList = useCallback(
    async (name: string) => {
      if (!userId) return { shoppingList: null, error: "Not signed in" };
      const trimmedName = name.trim();
      if (!trimmedName)
        return { shoppingList: null, error: "Name is required" };
      const { data, error } = await getSupabaseClient()
        .from("shopping_lists")
        .insert({ name: trimmedName, owner_id: userId })
        .select("*")
        .single();
      if (error) return { shoppingList: null, error: error.message };
      await refresh();
      return { shoppingList: data as ShoppingList, error: null };
    },
    [userId, refresh]
  );

  const renameShoppingList = useCallback(
    async (shoppingListId: string, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return { error: "Name is required" };
      const { error } = await getSupabaseClient()
        .from("shopping_lists")
        .update({ name: trimmedName, updated_at: new Date().toISOString() })
        .eq("id", shoppingListId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  const deleteShoppingList = useCallback(
    async (shoppingListId: string) => {
      const { error } = await getSupabaseClient()
        .from("shopping_lists")
        .delete()
        .eq("id", shoppingListId);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return {
    shoppingLists,
    loaded,
    createShoppingList,
    renameShoppingList,
    deleteShoppingList,
  };
}
