"use client";

import type { InventoryItem } from "@/types/inventory";

type Props = {
  item: InventoryItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function InventoryItemRow({ item, onToggle, onRemove }: Props) {
  return (
    <li className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-black/[.03] dark:hover:bg-white/[.05]">
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)}
        className="size-4 shrink-0 accent-foreground"
      />
      <span
        className={`flex-1 text-sm ${
          item.done ? "text-black/40 line-through dark:text-white/40" : ""
        }`}
      >
        {item.name}
        {item.brand && (
          <span className="ml-1 text-black/40 dark:text-white/40">
            ({item.brand})
          </span>
        )}
      </span>
      {item.nutri_score && (
        <span className="rounded bg-black/[.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase dark:bg-white/[.1]">
          {item.nutri_score}
        </span>
      )}
      {item.quantity > 1 && (
        <span className="text-xs text-black/40 dark:text-white/40">
          ×{item.quantity}
        </span>
      )}
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        className="text-black/30 opacity-0 transition-opacity hover:text-black/70 group-hover:opacity-100 dark:text-white/30 dark:hover:text-white/70"
      >
        ✕
      </button>
    </li>
  );
}
