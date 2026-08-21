"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { RecipeIngredientWithItem } from "@/types/recipeIngredient";

export function useRecipeIngredients(recipeId: string | null) {
  const [ingredients, setIngredients] = useState<RecipeIngredientWithItem[]>(
    []
  );
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!recipeId) {
      setIngredients([]);
      return;
    }
    const { data, error } = await getSupabaseClient()
      .from("recipe_ingredients")
      .select("*, item:items(*)")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: true });
    if (!error && data)
      setIngredients(data as unknown as RecipeIngredientWithItem[]);
  }, [recipeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const addIngredient = useCallback(
    async (itemId: string, quantity: number, unit: string) => {
      if (!recipeId) return { error: "No recipe selected" };
      const { error } = await getSupabaseClient()
        .from("recipe_ingredients")
        .insert({
          recipe_id: recipeId,
          item_id: itemId,
          quantity,
          unit: unit.trim() || null,
        });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [recipeId, refresh]
  );

  return { ingredients, loaded, addIngredient };
}
