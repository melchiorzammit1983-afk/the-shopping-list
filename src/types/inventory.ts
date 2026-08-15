export type InventoryCategory =
  | "food"
  | "drinks"
  | "household"
  | "personal_care"
  | "other";

export const CATEGORIES: InventoryCategory[] = [
  "food",
  "drinks",
  "household",
  "personal_care",
  "other",
];

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  food: "Food",
  drinks: "Drinks",
  household: "Household & Cleaning",
  personal_care: "Personal Care",
  other: "Other",
};

export type NutritionInfo = {
  energy_kcal_100g?: number;
  sugars_100g?: number;
  salt_100g?: number;
  fat_100g?: number;
  saturated_fat_100g?: number;
};

export type InventoryItem = {
  id: string;
  household_id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string | null;
  barcode: string | null;
  brand: string | null;
  image_url: string | null;
  nutrition: NutritionInfo | null;
  nutri_score: string | null;
  done: boolean;
  added_by: string | null;
  created_at: string;
};

export type NewInventoryItem = {
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit?: string | null;
  barcode?: string | null;
  brand?: string | null;
  image_url?: string | null;
  nutrition?: NutritionInfo | null;
  nutri_score?: string | null;
};
