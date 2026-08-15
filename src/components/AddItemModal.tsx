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
  onClose: () => void;
};

type ScannedInfo = {
  barcode: string;
  brand: string | null;
  imageUrl: string | null;
  nutriScore: string | null;
  nutrition: NutritionInfo | null;
};

export function AddItemModal({ onAdd, onClose }: Props) {
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
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl bg-background p-5 sm:rounded-2xl sm:border sm:border-black/10 sm:dark:border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add item</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name…"
              className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
            />
            <button
              type="button"
              onClick={() => setScanning(true)}
              className="shrink-0 rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/15"
            >
              Scan
            </button>
          </div>

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

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    category === c
                      ? "border-foreground bg-foreground text-background"
                      : "border-black/10 text-black/60 hover:border-black/30 dark:border-white/15 dark:text-white/60 dark:hover:border-white/30"
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex size-8 items-center justify-center rounded-full border border-black/10 text-lg leading-none dark:border-white/15"
              >
                −
              </button>
              <span className="w-6 text-center text-sm tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex size-8 items-center justify-center rounded-full border border-black/10 text-lg leading-none dark:border-white/15"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Add to inventory
          </button>
        </form>
      </div>

      {scanning && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
