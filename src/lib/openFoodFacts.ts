import type { NutritionInfo } from "@/types/inventory";

export type ProductLookup = {
  name: string;
  brand: string | null;
  imageUrl: string | null;
  nutriScore: string | null;
  nutrition: NutritionInfo | null;
};

type OpenFoodFactsResponse = {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    nutriments?: Record<string, number>;
  };
};

export async function lookupBarcode(
  barcode: string
): Promise<ProductLookup | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
  );
  if (!response.ok) return null;

  const data: OpenFoodFactsResponse = await response.json();
  if (data.status !== 1 || !data.product) return null;

  const { product } = data;
  const n = product.nutriments ?? {};

  return {
    name: product.product_name || "Unknown item",
    brand: product.brands ?? null,
    imageUrl: product.image_url ?? null,
    nutriScore: product.nutriscore_grade?.toUpperCase() ?? null,
    nutrition: {
      energy_kcal_100g: n["energy-kcal_100g"],
      sugars_100g: n["sugars_100g"],
      salt_100g: n["salt_100g"],
      fat_100g: n["fat_100g"],
      saturated_fat_100g: n["saturated-fat_100g"],
    },
  };
}
