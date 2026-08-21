import type { Item } from "@/types/item";

export type RecipeIngredientWithItem = {
  id: string;
  recipe_id: string;
  item_id: string;
  quantity: number;
  unit: string | null;
  created_at: string;
  item: Item;
};
