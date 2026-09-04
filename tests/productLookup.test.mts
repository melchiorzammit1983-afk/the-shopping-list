import assert from "node:assert/strict";
import test from "node:test";
import { localFirstLookup } from "../src/lib/productLookup/localFirst.ts";
import {
  lookupOpenFoodFacts,
  normalizeOpenFoodFactsProduct,
} from "../src/lib/productLookup/providers/openFoodFacts.ts";

test("local result prevents an external request", async () => {
  let externalCalls = 0;
  const result = await localFirstLookup(
    async () => ({ id: "local-product" }),
    async () => {
      externalCalls += 1;
      return { status: "found" };
    }
  );

  assert.equal(result.source, "local");
  assert.equal(externalCalls, 0);
});

test("unknown local barcode queries the external provider", async () => {
  let externalCalls = 0;
  const result = await localFirstLookup(
    async () => null,
    async () => {
      externalCalls += 1;
      return { status: "not_found" as const };
    }
  );

  assert.equal(result.source, "external");
  assert.equal(externalCalls, 1);
});

test("Open Food Facts response maps only supported catalogue fields", () => {
  const result = normalizeOpenFoodFactsProduct("3017620422003", {
    product_name: "Nutella",
    brands: "Ferrero",
    product_quantity: 400,
    product_quantity_unit: "g",
    categories: "Spreads, Hazelnut spreads",
    image_front_url: "https://images.openfoodfacts.org/front.jpg",
  });

  assert.deepEqual(result, {
    barcode: "3017620422003",
    barcodeType: "ean_13",
    name: "Nutella",
    canonicalName: "Nutella",
    brand: "Ferrero",
    variant: "",
    category: "Spreads",
    packageQuantity: "400",
    packageUnit: "g",
    imageUrl: "https://images.openfoodfacts.org/front.jpg",
    dataSource: "open_food_facts",
    verificationStatus: "unverified",
  });
});

test("partial provider response keeps missing values empty", () => {
  const result = normalizeOpenFoodFactsProduct("3017620422003", {
    product_name: "Nutella",
  });

  assert.equal(result?.brand, "");
  assert.equal(result?.variant, "");
  assert.equal(result?.packageQuantity, "");
  assert.equal(result?.packageUnit, "");
  assert.equal(result?.category, "");
  assert.equal(result?.imageUrl, null);
});

test("provider returns a normalized product", async () => {
  const result = await lookupOpenFoodFacts("3017620422003", async () =>
    Response.json({ status: "success", product: { product_name: "Nutella" } })
  );

  assert.equal(result.status, "found");
  if (result.status === "found") assert.equal(result.product.name, "Nutella");
});

test("provider not-found response remains a manual fallback", async () => {
  const result = await lookupOpenFoodFacts("3017620422003", async () =>
    Response.json({ status: "product_not_found" })
  );

  assert.equal(result.status, "not_found");
});

test("provider failure is handled without throwing", async () => {
  const result = await lookupOpenFoodFacts("3017620422003", async () => {
    throw new Error("offline");
  });

  assert.equal(result.status, "unavailable");
});

test("invalid barcode is rejected before calling the provider", async () => {
  let externalCalls = 0;
  const result = await lookupOpenFoodFacts("123", async () => {
    externalCalls += 1;
    return Response.json({});
  });

  assert.equal(result.status, "invalid");
  assert.equal(externalCalls, 0);
});
