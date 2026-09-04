import { openFoodFactsProvider } from "./providers/openFoodFacts";
import type { ExternalLookupResult, ProductLookupProvider } from "./types";

const providers: ProductLookupProvider[] = [openFoodFactsProvider];

export async function lookupExternalProduct(barcode: string): Promise<ExternalLookupResult> {
  for (const provider of providers) {
    const result = await provider.lookupByBarcode(barcode);
    if (result.status !== "not_found") return result;
  }

  return { status: "not_found" };
}

export type { ExternalLookupResult, ExternalProduct } from "./types";
