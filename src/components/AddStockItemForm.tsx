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
    unit: string,
    expiryDate: string | null,
    price: number | null
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
  const [expiryDate, setExpiryDate] = useState("");
  const [price, setPrice] = useState("");
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

    const parsedPrice = price.trim() ? parseFloat(price) : null;
    const result = await onAddStock(
      item.id,
      qty,
      finalUnit,
      expiryDate || null,
      parsedPrice
    );
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
    setExpiryDate("");
    setPrice("");
    setPhotoUrl(null);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-linen-border pt-6">
      <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
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
          className="flex-1 rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <button
          type="submit"
          className="rounded-full border border-linen-border bg-linen-card px-4 py-2 text-sm font-medium transition-colors hover:bg-herb-tint"
        >
          Search
        </button>
      </form>

      {searched && (
        <div className="flex flex-col gap-2">
          {results.length > 0 ? (
            <>
              <p className="text-xs text-charcoal-soft">
                Matches found — pick one, or create a new item below.
              </p>
              <ul className="flex flex-col gap-1">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectExisting(item)}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition-colors ${
                        selected?.id === item.id
                          ? "border-herb bg-herb-tint"
                          : "border-linen-border bg-linen-card hover:bg-herb-tint"
                      }`}
                    >
                      {item.name}
                      {item.unit && (
                        <span className="font-label ml-2 text-xs text-charcoal-soft">
                          ({item.unit})
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-charcoal-soft">
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
                className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
              />
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Unit, e.g. each / kg / l (optional)"
                className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
              />
              <div className="flex flex-col gap-2">
                {photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt=""
                    className="h-32 w-full rounded-2xl object-cover"
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
                  <p className="text-xs text-charcoal-soft">Uploading…</p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleAdd} className="flex flex-col gap-2">
            <input
              type="text"
              inputMode="decimal"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity, e.g. 500 or 500g"
              className="w-40 rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                aria-label="Expiry date (optional)"
                className="flex-1 rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm text-charcoal-soft outline-none focus:border-herb focus:ring-2 focus:ring-herb/20"
              />
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price (optional)"
                className="flex-1 rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
              />
            </div>
            <button
              type="submit"
              disabled={pending || uploadingPhoto}
              className="flex-1 rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
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

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
