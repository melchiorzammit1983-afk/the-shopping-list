"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Recipe } from "@/types/recipe";

export function useRecipes(userId: string | null) {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [sharedRecipes, setSharedRecipes] = useState<Recipe[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setMyRecipes([]);
      setSharedRecipes([]);
      return;
    }
    // RLS already limits rows to the caller's own recipes plus public ones.
    const { data, error } = await getSupabaseClient()
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMyRecipes(data.filter((r) => r.created_by === userId));
      setSharedRecipes(data.filter((r) => r.created_by !== userId));
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().then(() => setLoaded(true));
  }, [refresh]);

  const createRecipe = useCallback(
    async (
      name: string,
      method: string,
      servings: string,
      isPublic: boolean,
      imageUrl: string | null
    ) => {
      if (!userId) return { recipe: null, error: "Not signed in" };
      const trimmedName = name.trim();
      if (!trimmedName) return { recipe: null, error: "Name is required" };
      const parsedServings = servings.trim() ? parseFloat(servings) : null;
      try {
        const { data, error } = await getSupabaseClient()
          .from("recipes")
          .insert({
            name: trimmedName,
            method: method.trim(),
            servings: parsedServings,
            is_public: isPublic,
            image_url: imageUrl,
            created_by: userId,
          })
          .select("*")
          .single();
        if (error) return { recipe: null, error: error.message };
        await refresh();
        return { recipe: data as Recipe, error: null };
      } catch (err) {
        return {
          recipe: null,
          error: err instanceof Error ? err.message : "Could not save recipe",
        };
      }
    },
    [userId, refresh]
  );

  const updateRecipe = useCallback(
    async (
      recipeId: string,
      name: string,
      method: string,
      servings: string,
      isPublic: boolean,
      imageUrl: string | null
    ) => {
      const trimmedName = name.trim();
      if (!trimmedName) return { recipe: null, error: "Name is required" };
      const parsedServings = servings.trim() ? parseFloat(servings) : null;
      try {
        const { data, error } = await getSupabaseClient()
          .from("recipes")
          .update({
            name: trimmedName,
            method: method.trim(),
            servings: parsedServings,
            is_public: isPublic,
            image_url: imageUrl,
          })
          .eq("id", recipeId)
          .select("*")
          .single();
        if (error) return { recipe: null, error: error.message };
        await refresh();
        return { recipe: data as Recipe, error: null };
      } catch (err) {
        return {
          recipe: null,
          error: err instanceof Error ? err.message : "Could not save recipe",
        };
      }
    },
    [refresh]
  );

  return { myRecipes, sharedRecipes, loaded, createRecipe, updateRecipe };
}
