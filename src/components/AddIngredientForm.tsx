"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useItemCatalog } from "@/hooks/useItemCatalog";
import type { Item } from "@/types/item";

type Props = {
  onAddIngredient: (
    itemId: string,
    quantity: number,
    unit: string
  ) => Promise<{ error: string | null }>;
};

export function AddIngredientForm({ onAddIngredient }: Props) {
  const { searchItems, createItem } = useItemCatalog();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
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
    if (item.unit) setUnit(item.unit);
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
      const created = await createItem(query, category, finalUnit);
      if (created.error || !created.item) {
        setError(created.error ?? "Could not create item");
        setPending(false);
        return;
      }
      item = created.item;
    }

    const result = await onAddIngredient(item.id, qty, finalUnit);
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
    setQuantity("1");
    setUnit("");
  }

  const inputClass =
    "rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20";

  return (
    <div className="flex flex-col gap-4 border-t border-linen-border pt-6">
      <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
        Add ingredient
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
          placeholder="Ingredient name"
          className={`flex-1 ${inputClass}`}
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
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className={inputClass}
            />
          )}

          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity, e.g. 500 or 500g"
              className={`w-36 ${inputClass}`}
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Unit, e.g. g / cups"
              className={`w-32 ${inputClass}`}
            />
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add"}
            </button>
          </form>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
