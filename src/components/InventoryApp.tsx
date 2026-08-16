"use client";

import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { AddItemModal } from "./AddItemModal";
import { InventoryItemRow } from "./InventoryItemRow";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/inventory";
import type { Household } from "@/types/household";

type Props = {
  household: Household;
  identityName: string;
  onLeaveHousehold: () => void;
  onLogOut: () => void;
};

export function InventoryApp({
  household,
  identityName,
  onLeaveHousehold,
  onLogOut,
}: Props) {
  const { items, loaded, addItem, toggleItem, removeItem, clearDone } =
    useInventory(household.id, identityName);
  const [showAddModal, setShowAddModal] = useState(false);

  const remaining = items.filter((item) => !item.done);
  const done = items.filter((item) => item.done);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10 pb-24">
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
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={onLeaveHousehold}
            className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            Switch household
          </button>
          <button
            onClick={onLogOut}
            className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            Log out
          </button>
        </div>
      </header>

      {loaded && items.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          Your household inventory is empty. Tap + to add something.
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

      <button
        onClick={() => setShowAddModal(true)}
        aria-label="Add item"
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-foreground text-2xl leading-none text-background shadow-lg transition-opacity hover:opacity-90"
      >
        +
      </button>

      {showAddModal && (
        <AddItemModal
          onAdd={addItem}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
