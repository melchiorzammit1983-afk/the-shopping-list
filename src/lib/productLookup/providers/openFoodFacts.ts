import { barcodeType, isValidExternalBarcode, normalizeBarcode } from "../barcodes.ts";
import type { ExternalLookupResult, ExternalProduct, ProductLookupProvider } from "../types.ts";

type OpenFoodFactsProduct = {
  code?: unknown;
  product_name?: unknown;
  product_name_en?: unknown;
  brands?: unknown;
  quantity?: unknown;
  product_quantity?: unknown;
  product_quantity_unit?: unknown;
  categories?: unknown;
  image_front_url?: unknown;
};

type OpenFoodFactsResponse = {
  status?: unknown;
  product?: OpenFoodFactsProduct;
};

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "quantity",
  "product_quantity",
  "product_quantity_unit",
  "categories",
  "image_front_url",
].join(",");

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function packageSize(product: OpenFoodFactsProduct) {
  const explicitQuantity =
    typeof product.product_quantity === "number"
      ? product.product_quantity
      : Number.parseFloat(text(product.product_quantity));
  const explicitUnit = text(product.product_quantity_unit).toLowerCase();

  if (Number.isFinite(explicitQuantity) && explicitQuantity > 0 && explicitUnit) {
    return { quantity: String(explicitQuantity), unit: explicitUnit };
  }

  const match = text(product.quantity).match(/^([0-9]+(?:[.,][0-9]+)?)\s*([a-zA-Zµμ]+)$/);
  if (!match) return { quantity: "", unit: "" };

  return {
    quantity: match[1].replace(",", "."),
    unit: match[2].toLowerCase(),
  };
}

export function normalizeOpenFoodFactsProduct(
  requestedBarcode: string,
  product: OpenFoodFactsProduct
): ExternalProduct | null {
  const name = text(product.product_name) || text(product.product_name_en);
  if (!name) return null;

  const size = packageSize(product);
  const categories = text(product.categories)
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

  return {
    barcode: requestedBarcode,
    barcodeType: barcodeType(requestedBarcode),
    name,
    canonicalName: name,
    brand: text(product.brands),
    variant: "",
    category: categories[0] ?? "",
    packageQuantity: size.quantity,
    packageUnit: size.unit,
    imageUrl: text(product.image_front_url) || null,
    dataSource: "open_food_facts",
    verificationStatus: "unverified",
  };
}

export async function lookupOpenFoodFacts(
  value: string,
  fetcher: Fetcher = fetch
): Promise<ExternalLookupResult> {
  const barcode = normalizeBarcode(value);
  if (!isValidExternalBarcode(barcode)) {
    return { status: "invalid", message: "Enter a valid EAN, UPC or GTIN barcode." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  const url = new URL(
    `/api/v3.6/product/${encodeURIComponent(barcode)}.json`,
    "https://world.openfoodfacts.org"
  );
  url.searchParams.set("fields", FIELDS);

  try {
    const response = await fetcher(url, {
      headers: {
        "User-Agent":
          "TheHomeButler/1.0 (https://github.com/melchiorzammit1983-afk/the-shopping-list)",
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (response.status === 404) return { status: "not_found" };
    if (!response.ok) {
      return { status: "unavailable", message: "Product lookup is temporarily unavailable." };
    }

    const body = (await response.json()) as OpenFoodFactsResponse;
    if (!body.product || body.status === 0 || body.status === "product_not_found") {
      return { status: "not_found" };
    }

    const product = normalizeOpenFoodFactsProduct(barcode, body.product);
    return product ? { status: "found", product } : { status: "not_found" };
  } catch {
    return { status: "unavailable", message: "Product lookup is temporarily unavailable." };
  } finally {
    clearTimeout(timeout);
  }
}

export const openFoodFactsProvider: ProductLookupProvider = {
  name: "Open Food Facts",
  lookupByBarcode: lookupOpenFoodFacts,
};
