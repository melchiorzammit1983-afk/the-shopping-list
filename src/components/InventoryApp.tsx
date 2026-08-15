"use client";

import { useInventory } from "@/hooks/useInventory";
import { useAuth } from "@/hooks/useAuth";
import { AddItemForm } from "./AddItemForm";
import { InventoryItemRow } from "./InventoryItemRow";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/inventory";
import type { Household } from "@/types/household";

type Props = {
  household: Household;
};

export function InventoryApp({ household }: Props) {
  const { signOut } = useAuth();
  const { items, loaded, addItem, toggleItem, removeItem, clearDone } =
    useInventory(household.id);

  const remaining = items.filter((item) => !item.done);
  const done = items.filter((item) => item.done);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{household.name}</h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            {loaded
              ? `${remaining.length} to get${
                  done.length ? `, ${done.length} done` : ""
                }`
              : "Loading…"}
          </p>
          <p className="mt-1 text-xs text-black/30 dark:text-white/30">
            Household ID (share to invite): {household.id}
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
        >
          Sign out
        </button>
      </header>

      <AddItemForm onAdd={addItem} />

      {loaded && items.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          Your household inventory is empty. Add something above.
        </p>
      )}

      {CATEGORIES.map((category) => {
        const categoryItems = remaining.filter(
          (item) => item.category === category
        );
        if (categoryItems.length === 0) return null;
        return (
          <div key={category} className="flex flex-col gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
              {CATEGORY_LABELS[category]}
            </h2>
            <ul className="flex flex-col">
              {categoryItems.map((item) => (
                <InventoryItemRow
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onRemove={removeItem}
                />
              ))}
            </ul>
          </div>
        );
      })}

      {done.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
              Done
            </h2>
            <button
              onClick={clearDone}
              className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
            >
              Clear done
            </button>
          </div>
          <ul className="flex flex-col">
            {done.map((item) => (
              <InventoryItemRow
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onRemove={removeItem}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
