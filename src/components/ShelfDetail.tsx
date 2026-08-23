"use client";

import { useState } from "react";
import { useStockEntries } from "@/hooks/useStockEntries";
import { useWasteLog } from "@/hooks/useWasteLog";
import { AddStockItemForm } from "@/components/AddStockItemForm";
import { WASTE_REASONS } from "@/lib/wasteReasons";
import type { Shelf } from "@/types/shelf";
import type { Item } from "@/types/item";
import type { StockEntryWithItem } from "@/types/stockEntry";

type Props = {
  shelf: Shelf;
  userId: string;
  onBack: () => void;
  onSelectItem: (item: Item) => void;
};

export function ShelfDetail({ shelf, userId, onBack, onSelectItem }: Props) {
  const { entries, loaded, addStock, adjustQuantity, setQuantity, removeEntry } =
    useStockEntries(shelf.id);
  const { logWaste } = useWasteLog(userId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAdjust(entryId: string, delta: number) {
    setPendingId(entryId);
    setError("");
    const result = await adjustQuantity(entryId, delta);
    setPendingId(null);
    if (result.error) setError(result.error);
  }

  async function handleSetQuantity(entry: StockEntryWithItem) {
    const input = window.prompt(
      `Set quantity for ${entry.item.name}`,
      `${entry.quantity}${entry.unit ?? ""}`
    );
    if (input === null) return;
    const match = input.trim().match(/^(\d*\.?\d+)\s*([a-zA-Z]*)$/);
    if (!match) {
      setError("Quantity must be a number, e.g. 500 or 500g");
      return;
    }
    const qty = parseFloat(match[1]);
    if (Number.isNaN(qty) || qty < 0) {
      setError("Quantity must be zero or a positive number");
      return;
    }
    const unit = match[2] || entry.unit || "";
    setPendingId(entry.id);
    setError("");
    const result = await setQuantity(entry.id, qty, unit);
    setPendingId(null);
    if (result.error) setError(result.error);
  }

  async function handleRemoveWithReason(
    entry: StockEntryWithItem,
    reason: string
  ) {
    setPendingId(entry.id);
    setError("");
    const logResult = await logWaste(
      entry.item_id,
      entry.quantity,
      entry.unit,
      reason,
      userId
    );
    if (logResult.error) {
      setPendingId(null);
      setError(logResult.error);
      return;
    }
    const result = await removeEntry(entry.id);
    setPendingId(null);
    setRemovingId(null);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
        >
          ← Shelves
        </button>
        <h1 className="text-2xl font-semibold">{shelf.name}</h1>
      </header>

      {loaded && entries.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          Nothing here. Add something before it disappears on its own.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col gap-2 rounded-lg px-2 py-2 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectItem(entry.item)}
                className="text-left text-sm"
              >
                {entry.item.name}
                {(entry.expiry_date || entry.price != null) && (
                  <span className="ml-2 text-xs text-black/40 dark:text-white/40">
                    {entry.expiry_date ? `exp. ${entry.expiry_date}` : ""}
                    {entry.expiry_date && entry.price != null ? " · " : ""}
                    {entry.price != null ? `€${entry.price}` : ""}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjust(entry.id, -1)}
                  disabled={pendingId === entry.id || entry.quantity <= 0}
                  aria-label={`Decrease ${entry.item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-sm leading-none hover:bg-black/[.05] disabled:opacity-30 dark:border-white/15 dark:hover:bg-white/[.08]"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuantity(entry)}
                  disabled={pendingId === entry.id}
                  className="w-16 text-center text-xs text-black/40 hover:text-black/70 disabled:opacity-30 dark:text-white/40 dark:hover:text-white/70"
                >
                  {entry.quantity}
                  {entry.unit ? ` ${entry.unit}` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust(entry.id, 1)}
                  disabled={pendingId === entry.id}
                  aria-label={`Increase ${entry.item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-sm leading-none hover:bg-black/[.05] disabled:opacity-30 dark:border-white/15 dark:hover:bg-white/[.08]"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRemovingId(removingId === entry.id ? null : entry.id)
                  }
                  disabled={pendingId === entry.id}
                  className="text-xs text-black/40 hover:text-red-600 disabled:opacity-30 dark:text-white/40 dark:hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>

            {removingId === entry.id && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-black/[.03] p-2 dark:bg-white/[.05]">
                <span className="text-xs text-black/40 dark:text-white/40">
                  Why&apos;s it going?
                </span>
                {WASTE_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => handleRemoveWithReason(entry, reason.value)}
                    disabled={pendingId === entry.id}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/[.05] disabled:opacity-30 dark:border-white/15 dark:hover:bg-white/[.08]"
                  >
                    {reason.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRemovingId(null)}
                  className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
                >
                  Never mind
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <AddStockItemForm userId={userId} onAddStock={addStock} />
    </div>
  );
}
