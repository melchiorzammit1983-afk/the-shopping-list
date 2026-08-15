"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { BarcodeScanner } from "./BarcodeScanner";
import { lookupBarcode } from "@/lib/openFoodFacts";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type InventoryCategory,
  type NewInventoryItem,
  type NutritionInfo,
} from "@/types/inventory";

type Props = {
  onAdd: (item: NewInventoryItem) => void;
};

type ScannedInfo = {
  barcode: string;
  brand: string | null;
  imageUrl: string | null;
  nutriScore: string | null;
  nutrition: NutritionInfo | null;
};

export function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("food");
  const [quantity, setQuantity] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<
    "idle" | "looking-up" | "not-found"
  >("idle");
  const [scanned, setScanned] = useState<ScannedInfo | null>(null);

  async function handleBarcodeDetected(barcode: string) {
    setScanning(false);
    setScanStatus("looking-up");
    const product = await lookupBarcode(barcode);
    if (!product) {
      setScanStatus("not-found");
      setScanned({
        barcode,
        brand: null,
        imageUrl: null,
        nutriScore: null,
        nutrition: null,
      });
      return;
    }
    setName(product.name);
    setScanned({
      barcode,
      brand: product.brand,
      imageUrl: product.imageUrl,
      nutriScore: product.nutriScore,
      nutrition: product.nutrition,
    });
    setScanStatus("idle");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name,
      category,
      quantity,
      barcode: scanned?.barcode ?? null,
      brand: scanned?.brand ?? null,
      image_url: scanned?.imageUrl ?? null,
      nutrition: scanned?.nutrition ?? null,
      nutri_score: scanned?.nutriScore ?? null,
    });
    setName("");
    setQuantity(1);
    setScanned(null);
    setScanStatus("idle");
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add an item…"
          className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as InventoryCategory)}
          className="rounded-lg border border-black/10 bg-white px-2 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Number(e.target.value) || 1))
          }
          className="w-16 rounded-lg border border-black/10 bg-white px-2 py-2 text-center text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/15"
        >
          Scan
        </button>
        <button
          type="submit"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Add
        </button>
      </form>

      {scanStatus === "looking-up" && (
        <p className="text-xs text-black/40 dark:text-white/40">
          Looking up product…
        </p>
      )}
      {scanStatus === "not-found" && (
        <p className="text-xs text-black/40 dark:text-white/40">
          Barcode scanned, but no product info found — enter details
          manually.
        </p>
      )}
      {scanned && scanned.nutriScore && (
        <p className="text-xs text-black/40 dark:text-white/40">
          Nutri-Score: {scanned.nutriScore}
          {scanned.brand ? ` · ${scanned.brand}` : ""}
        </p>
      )}

      {scanning && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
