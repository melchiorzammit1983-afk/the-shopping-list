"use client";

import { useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { localFirstLookup } from "@/lib/productLookup/localFirst";
import { normalizeBarcode } from "@/lib/productLookup/barcodes";
import type { ExternalLookupResult } from "@/lib/productLookup";
import type { Item, ProductDraft } from "@/types/item";

type ProductAssets = {
  frontImagePath: string | null;
  frontImageUrl: string | null;
  barcodeImagePath: string | null;
  barcodeImageUrl: string | null;
};

const productSelect = "*, barcodes:product_barcodes(*), images:product_images(*)";

export function useItemCatalog() {
  const searchItems = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return { items: [] as Item[], error: null };

    const terms = ["name", "canonical_name", "brand"] as const;
    const responses = await Promise.all(
      terms.map((column) =>
        getSupabaseClient()
          .from("items")
          .select(productSelect)
          .ilike(column, `%${trimmed}%`)
          .order("name", { ascending: true })
          .limit(10)
      )
    );
    const failed = responses.find((response) => response.error);
    if (failed?.error) return { items: [] as Item[], error: failed.error.message };

    const unique = new Map<string, Item>();
    responses.forEach(({ data }) =>
      (data ?? []).forEach((item) => unique.set(item.id, item as Item))
    );
    return {
      items: [...unique.values()].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10),
      error: null,
    };
  }, []);

  const createItem = useCallback(
    async (name: string, category: string, unit: string, imageUrl: string | null = null) => {
      const trimmedName = name.trim();
      if (!trimmedName) return { item: null, error: "Name is required" };
      const { data, error } = await getSupabaseClient()
        .from("items")
        .insert({
          name: trimmedName,
          canonical_name: trimmedName,
          category: category.trim() || null,
          unit: unit.trim() || null,
          package_unit: unit.trim() || null,
          image_url: imageUrl,
        })
        .select("*")
        .single();
      if (error) return { item: null, error: error.message };
      return { item: data as Item, error: null };
    },
    []
  );

  const getProduct = useCallback(async (id: string) => {
    const { data, error } = await getSupabaseClient()
      .from("items")
      .select(productSelect)
      .eq("id", id)
      .single();
    if (error) return { product: null, error: error.message };
    return { product: data as unknown as Item, error: null };
  }, []);

  const searchProductByBarcode = useCallback(async (value: string) => {
    const normalized = normalizeBarcode(value);
    if (!normalized) return { product: null, error: "Enter a barcode" };
    const { data, error } = await getSupabaseClient()
      .from("product_barcodes")
      .select("product_id")
      .eq("barcode_value", normalized)
      .maybeSingle();
    if (error) return { product: null, error: error.message };
    if (!data) return { product: null, error: null };
    return getProduct(data.product_id);
  }, [getProduct]);

  const lookupProductByBarcode = useCallback(async (value: string) => {
    const normalized = normalizeBarcode(value);
    if (!normalized) {
      return { status: "invalid" as const, message: "Enter a barcode" };
    }

    try {
      const result = await localFirstLookup(
        async () => {
          const local = await searchProductByBarcode(normalized);
          if (local.error) throw new Error(local.error);
          return local.product;
        },
        async () => {
          const { data } = await getSupabaseClient().auth.getSession();
          const token = data.session?.access_token;
          if (!token) {
            return {
              status: "unavailable",
              message: "Sign in again to search external products.",
            } satisfies ExternalLookupResult;
          }

          const response = await fetch(
            `/api/products/lookup?barcode=${encodeURIComponent(normalized)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const body = (await response.json()) as Partial<ExternalLookupResult>;
          if (
            body.status === "found" ||
            body.status === "not_found" ||
            body.status === "invalid" ||
            body.status === "unavailable"
          ) {
            return body as ExternalLookupResult;
          }
          return {
            status: "unavailable",
            message: "Product lookup is temporarily unavailable.",
          } satisfies ExternalLookupResult;
        }
      );

      if (result.source === "local") {
        return { status: "local" as const, product: result.value };
      }
      return result.value;
    } catch {
      return {
        status: "unavailable" as const,
        message: "Product lookup is temporarily unavailable.",
      };
    }
  }, [searchProductByBarcode]);

  const createProduct = useCallback(async (draft: ProductDraft, assets: ProductAssets) => {
    const quantity = draft.packageQuantity.trim() ? Number(draft.packageQuantity) : null;
    if (!draft.name.trim()) return { product: null, error: "Product name is required" };
    if (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0)) {
      return { product: null, error: "Package quantity must be a positive number" };
    }

    const { data: id, error } = await getSupabaseClient().rpc(
      "create_catalogue_product",
      {
        product_name: draft.name,
        product_canonical_name: draft.canonicalName || draft.name,
        product_brand: draft.brand || null,
        product_variant: draft.variant || null,
        product_category: draft.category || null,
        product_package_quantity: quantity,
        product_package_unit: draft.packageUnit || null,
        product_barcode_value: normalizeBarcode(draft.barcodeValue) || null,
        product_barcode_type: draft.barcodeValue ? draft.barcodeType : null,
        product_data_source: draft.dataSource,
        front_image_path: assets.frontImagePath,
        front_image_url: assets.frontImageUrl,
        barcode_image_path: assets.barcodeImagePath,
        barcode_image_url: assets.barcodeImageUrl,
      }
    );
    if (error) {
      return {
        product: null,
        error: error.message,
      };
    }
    return getProduct(id as string);
  }, [getProduct]);

  const updateProduct = useCallback(async (productId: string, draft: ProductDraft) => {
    const quantity = draft.packageQuantity.trim() ? Number(draft.packageQuantity) : null;
    if (!draft.name.trim()) return { product: null, error: "Product name is required" };
    if (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0)) {
      return { product: null, error: "Package quantity must be a positive number" };
    }
    const { error } = await getSupabaseClient()
      .from("items")
      .update({
        name: draft.name.trim(),
        canonical_name: draft.canonicalName.trim() || draft.name.trim(),
        brand: draft.brand.trim() || null,
        variant: draft.variant.trim() || null,
        category: draft.category.trim() || null,
        package_quantity: quantity,
        package_unit: draft.packageUnit.trim() || null,
        verification_status: "user_verified",
      })
      .eq("id", productId);
    if (error) return { product: null, error: error.message };
    return getProduct(productId);
  }, [getProduct]);

  return { searchItems, createItem, lookupProductByBarcode, createProduct, updateProduct };
}
