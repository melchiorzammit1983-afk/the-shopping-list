"use client";

import { useState } from "react";
import { useLocationStock } from "@/hooks/useLocationStock";
import { AddItemForm } from "@/components/AddItemForm";
import type { Location } from "@/types/location";

type Props = {
  location: Location;
  onBack: () => void;
};

export function LocationDetail({ location, onBack }: Props) {
  const { stock, loaded, addStock, adjustQuantity } = useLocationStock(
    location.id
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAdjust(stockId: string, delta: number) {
    setPendingId(stockId);
    setError("");
    const result = await adjustQuantity(stockId, delta);
    setPendingId(null);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            ← Locations
          </button>
          <h1 className="text-2xl font-semibold">{location.name}</h1>
          {location.type && (
            <p className="text-sm text-black/50 dark:text-white/50">
              {location.type}
            </p>
          )}
        </div>
      </header>

      {loaded && stock.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          No items here yet. Add one below.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {stock.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
          >
            <span className="text-sm">{row.item.name}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdjust(row.id, -1)}
                disabled={pendingId === row.id || row.quantity <= 0}
                aria-label={`Decrease ${row.item.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-sm leading-none hover:bg-black/[.05] disabled:opacity-30 dark:border-white/15 dark:hover:bg-white/[.08]"
              >
                −
              </button>
              <span className="w-16 text-center text-xs text-black/40 dark:text-white/40">
                {row.quantity}
                {row.item.unit ? ` ${row.item.unit}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleAdjust(row.id, 1)}
                disabled={pendingId === row.id}
                aria-label={`Increase ${row.item.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-sm leading-none hover:bg-black/[.05] disabled:opacity-30 dark:border-white/15 dark:hover:bg-white/[.08]"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <AddItemForm onAddStock={addStock} />
    </div>
  );
}
