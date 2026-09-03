"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import type { ShoppingList } from "@/types/shoppingList";

type Props = {
  userId: string;
  onBack: () => void;
  onSelectShoppingList: (shoppingList: ShoppingList) => void;
};

function formatStatus(status: ShoppingList["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ShoppingListsList({
  userId,
  onBack,
  onSelectShoppingList,
}: Props) {
  const { shoppingLists, loaded, createShoppingList } =
    useShoppingLists(userId);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await createShoppingList(name);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          type="button"
          onClick={onBack}
          className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
        >
          ← Your kitchen
        </button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Shopping lists
        </h1>
      </header>

      {loaded && shoppingLists.length === 0 && (
        <p className="text-sm text-charcoal-soft">
          No shopping lists yet — create your first one below.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {shoppingLists.map((shoppingList) => (
          <li key={shoppingList.id}>
            <button
              type="button"
              onClick={() => onSelectShoppingList(shoppingList)}
              className="flex w-full flex-col gap-3 rounded-3xl border border-linen-border bg-linen-card px-5 py-4 text-left shadow-sm transition-colors hover:border-herb/40 hover:bg-herb-tint"
            >
              <span className="font-display text-lg font-semibold">
                {shoppingList.name}
              </span>
              <span className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 font-label text-xs text-charcoal-soft">
                <span>0 items</span>
                <span aria-hidden="true">·</span>
                <span>{formatStatus(shoppingList.status)}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={shoppingList.created_at}>
                  {new Date(shoppingList.created_at).toLocaleDateString()}
                </time>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-linen-border pt-6"
      >
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Create a shopping list
        </h2>
        <input
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name, e.g. Weekly shop"
          className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create list"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}
