"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useItemCatalog } from "@/hooks/useItemCatalog";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import type { Item } from "@/types/item";

type Props = {
  userId: string;
  onAddStock: (
    itemId: string,
    quantity: number,
    unit: string
  ) => Promise<{ error: string | null }>;
};

export function AddStockItemForm({ userId, onAddStock }: Props) {
  const { searchItems, createItem } = useItemCatalog();
  const { uploadPhoto } = usePhotoUpload(userId, "item-photos");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSelected(null);
    const result = await searchItems(query);
    if (result.error) {
      setError(result.error);
      return;
    }
    setResults(result.items);
    setSearched(true);
  }

  function selectExisting(item: Item) {
    setSelected(item);
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError("");
    const result = await uploadPhoto(file);
    setUploadingPhoto(false);
    if (result.error || !result.url) {
      setError(result.error ?? "Could not upload photo");
      return;
    }
    setPhotoUrl(result.url);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    // Accept either "500" typed with a separate unit, or "500g" typed
    // together in this one field.
    const match = quantity.trim().match(/^(\d*\.?\d+)\s*([a-zA-Z]*)$/);
    if (!match) {
      setError("Quantity must be a number, e.g. 500 or 500g");
      setPending(false);
      return;
    }
    const qty = parseFloat(match[1]);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number");
      setPending(false);
      return;
    }
    const finalUnit = unit.trim() || match[2];

    let item = selected;
    if (!item) {
      const created = await createItem(query, category, finalUnit, photoUrl);
      if (created.error || !created.item) {
        setError(created.error ?? "Could not create item");
        setPending(false);
        return;
      }
      item = created.item;
    }

    const result = await onAddStock(item.id, qty, finalUnit);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setQuery("");
    setResults([]);
    setSearched(false);
    setSelected(null);
    setCategory("");
    setUnit("");
    setQuantity("1");
    setPhotoUrl(null);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-black/10 pt-6 dark:border-white/15">
      <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
        Add item
      </h2>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          required
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearched(false);
            setSelected(null);
          }}
          placeholder="Item name"
          className="flex-1 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="submit"
          className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.05]"
        >
          Search
        </button>
      </form>

      {searched && (
        <div className="flex flex-col gap-2">
          {results.length > 0 ? (
            <>
              <p className="text-xs text-black/40 dark:text-white/40">
                Matches found — pick one, or create a new item below.
              </p>
              <ul className="flex flex-col gap-1">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectExisting(item)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                        selected?.id === item.id
                          ? "border-black bg-black/[.03] dark:border-white dark:bg-white/[.08]"
                          : "border-black/10 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.05]"
                      }`}
                    >
                      {item.name}
                      {item.unit && (
                        <span className="ml-2 text-xs text-black/40 dark:text-white/40">
                          ({item.unit})
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-black/40 dark:text-white/40">
              No matches — this will create a new item.
            </p>
          )}

          {!selected && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (optional)"
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
              />
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Unit, e.g. each / kg / l (optional)"
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
              />
              <div className="flex flex-col gap-2">
                {photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt=""
                    className="h-32 w-full rounded-lg object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                  className="text-sm"
                />
                {uploadingPhoto && (
                  <p className="text-xs text-black/40 dark:text-white/40">
                    Uploading…
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity, e.g. 500 or 500g"
              className="w-40 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
            />
            <button
              type="submit"
              disabled={pending || uploadingPhoto}
              className="flex-1 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending
                ? "Adding…"
                : selected
                  ? `Add ${selected.name} to this shelf`
                  : "Create item and add to this shelf"}
            </button>
          </form>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
