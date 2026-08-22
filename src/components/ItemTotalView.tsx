"use client";

import { useItemTotal } from "@/hooks/useItemTotal";
import type { Item } from "@/types/item";

type Props = {
  item: Item;
  onBack: () => void;
};

export function ItemTotalView({ item, onBack }: Props) {
  const { breakdown, totals, loaded } = useItemTotal(item.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold">{item.name}</h1>
      </header>

      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt=""
          className="h-48 w-full rounded-lg object-cover"
        />
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Total across all shelves
        </h2>
        {loaded && totals.length === 0 && (
          <p className="text-sm text-black/40 dark:text-white/40">
            None in stock.
          </p>
        )}
        {totals.map((total) => (
          <p key={total.label} className="text-lg font-semibold">
            {total.amount} {total.label}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/15">
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Breakdown
        </h2>
        <ul className="flex flex-col gap-1">
          {breakdown.map((row) => (
            <li
              key={row.entryId}
              className="flex items-center justify-between rounded-lg px-2 py-2"
            >
              <span className="text-sm">
                {row.locationName} · {row.roomName} · {row.shelfName}
              </span>
              <span className="text-xs text-black/40 dark:text-white/40">
                {row.quantity}
                {row.unit ? ` ${row.unit}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
