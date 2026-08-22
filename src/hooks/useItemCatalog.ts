"use client";

import { useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Item } from "@/types/item";

export function useItemCatalog() {
  const searchItems = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return { items: [] as Item[], error: null };
    const { data, error } = await getSupabaseClient()
      .from("items")
      .select("*")
      .ilike("name", `%${trimmed}%`)
      .order("name", { ascending: true })
      .limit(10);
    if (error) return { items: [] as Item[], error: error.message };
    return { items: data ?? [], error: null };
  }, []);

  const createItem = useCallback(
    async (
      name: string,
      category: string,
      unit: string,
      imageUrl: string | null = null
    ) => {
      const trimmedName = name.trim();
      if (!trimmedName) return { item: null, error: "Name is required" };
      const { data, error } = await getSupabaseClient()
        .from("items")
        .insert({
          name: trimmedName,
          category: category.trim() || null,
          unit: unit.trim() || null,
          image_url: imageUrl,
        })
        .select("*")
        .single();
      if (error) return { item: null, error: error.message };
      return { item: data as Item, error: null };
    },
    []
  );

  return { searchItems, createItem };
}
