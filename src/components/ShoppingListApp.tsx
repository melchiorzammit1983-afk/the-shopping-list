"use client";

import { useShoppingList } from "@/hooks/useShoppingList";
import { AddItemForm } from "./AddItemForm";
import { ShoppingListItemRow } from "./ShoppingListItemRow";

export function ShoppingListApp() {
  const { items, loaded, addItem, toggleItem, removeItem, clearDone } =
    useShoppingList();

  const remaining = items.filter((item) => !item.done);
  const done = items.filter((item) => item.done);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Shopping List</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {loaded
            ? `${remaining.length} to get${
                done.length ? `, ${done.length} done` : ""
              }`
            : "Loading…"}
        </p>
      </header>

      <AddItemForm onAdd={addItem} />

      {loaded && items.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          Your list is empty. Add something above.
        </p>
      )}

      <ul className="flex flex-col">
        {remaining.map((item) => (
          <ShoppingListItemRow
            key={item.id}
            item={item}
            onToggle={toggleItem}
            onRemove={removeItem}
          />
        ))}
      </ul>

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
              <ShoppingListItemRow
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
