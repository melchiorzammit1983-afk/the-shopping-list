"use client";

import { useState } from "react";
import { useStockEntries } from "@/hooks/useStockEntries";
import { useWasteLog } from "@/hooks/useWasteLog";
import { AddStockItemForm } from "@/components/AddStockItemForm";
import { ItemThumbnail } from "@/components/ItemThumbnail";
import { WASTE_REASONS } from "@/lib/wasteReasons";
import { getFreshnessStatus } from "@/lib/freshness";
import { shelfTypeInfo } from "@/lib/shelfTypes";
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
  const typeInfo = shelfTypeInfo(shelf.type);

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
          className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
        >
          ← Shelves
        </button>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {shelf.name}
          </h1>
          {typeInfo && (
            <span
              className={`font-label rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${typeInfo.bg} ${typeInfo.on}`}
            >
              {typeInfo.emoji} {typeInfo.label}
            </span>
          )}
        </div>
      </header>

      {loaded && entries.length === 0 && (
        <p className="text-sm text-charcoal-soft">
          Nothing here. Add something before it disappears on its own.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col gap-2 rounded-3xl border border-linen-border bg-linen-card p-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectItem(entry.item)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <ItemThumbnail
                  imageUrl={entry.item.image_url}
                  freshness={getFreshnessStatus(entry.expiry_date)}
                  alt={entry.item.name}
                />
                <span className="text-sm">
                  <span className="block font-medium">{entry.item.name}</span>
                  {(entry.expiry_date || entry.price != null) && (
                    <span className="font-label block text-xs text-charcoal-soft">
                      {entry.expiry_date ? `exp. ${entry.expiry_date}` : ""}
                      {entry.expiry_date && entry.price != null ? " · " : ""}
                      {entry.price != null ? `€${entry.price}` : ""}
                    </span>
                  )}
                </span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjust(entry.id, -1)}
                  disabled={pendingId === entry.id || entry.quantity <= 0}
                  aria-label={`Decrease ${entry.item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-linen-border text-sm leading-none transition-colors hover:bg-herb-tint disabled:opacity-30"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuantity(entry)}
                  disabled={pendingId === entry.id}
                  className="font-label w-16 text-center text-xs text-charcoal-soft transition-colors hover:text-herb disabled:opacity-30"
                >
                  {entry.quantity}
                  {entry.unit ? ` ${entry.unit}` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust(entry.id, 1)}
                  disabled={pendingId === entry.id}
                  aria-label={`Increase ${entry.item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-linen-border text-sm leading-none transition-colors hover:bg-herb-tint disabled:opacity-30"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRemovingId(removingId === entry.id ? null : entry.id)
                  }
                  disabled={pendingId === entry.id}
                  className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-danger disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            </div>

            {removingId === entry.id && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-expired-tint p-3">
                <span className="font-label text-xs uppercase tracking-wide text-charcoal-soft">
                  Why&apos;s it going?
                </span>
                {WASTE_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => handleRemoveWithReason(entry, reason.value)}
                    disabled={pendingId === entry.id}
                    className="rounded-full border border-linen-border bg-linen-card px-3 py-1 text-xs font-medium transition-colors hover:bg-herb-tint disabled:opacity-30"
                  >
                    {reason.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRemovingId(null)}
                  className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-charcoal"
                >
                  Never mind
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-danger">{error}</p>}

      <AddStockItemForm userId={userId} onAddStock={addStock} />
    </div>
  );
}
