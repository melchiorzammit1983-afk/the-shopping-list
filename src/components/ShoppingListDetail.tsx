"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import type { ShoppingList } from "@/types/shoppingList";

type Props = {
  shoppingList: ShoppingList;
  userId: string;
  onBack: () => void;
  onDeleted: () => void;
};

export function ShoppingListDetail({
  shoppingList,
  userId,
  onBack,
  onDeleted,
}: Props) {
  const { renameShoppingList, deleteShoppingList } =
    useShoppingLists(userId);
  const [name, setName] = useState(shoppingList.name);
  const [savedName, setSavedName] = useState(shoppingList.name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const statusLabel =
    shoppingList.status.charAt(0).toUpperCase() + shoppingList.status.slice(1);

  async function handleRename(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await renameShoppingList(shoppingList.id, name);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSavedName(name.trim());
  }

  async function handleDelete() {
    if (!window.confirm(`Delete “${savedName}”? This cannot be undone.`)) return;
    setPending(true);
    setError("");
    const result = await deleteShoppingList(shoppingList.id);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onDeleted();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          type="button"
          onClick={onBack}
          className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
        >
          ← Shopping lists
        </button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {savedName}
        </h1>
        <p className="mt-1 text-sm text-charcoal-soft">
          {statusLabel} · 0 items · Created{" "}
          <time dateTime={shoppingList.created_at}>
            {new Date(shoppingList.created_at).toLocaleDateString()}
          </time>
        </p>
      </header>

      <div className="rounded-3xl border border-linen-border bg-linen-card p-5 shadow-sm">
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Items
        </h2>
        <p className="mt-2 text-sm text-charcoal-soft">
          No items yet. Shopping-list items will be added in a later milestone.
        </p>
      </div>

      <form
        onSubmit={handleRename}
        className="flex flex-col gap-2 border-t border-linen-border pt-6"
      >
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Rename list
        </h2>
        <input
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <button
          type="submit"
          disabled={pending || name.trim() === savedName}
          className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save name"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-full border border-danger px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-expired-tint disabled:opacity-50"
      >
        Delete list
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
