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
          className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
        >
          ← Back
        </button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {item.name}
        </h1>
      </header>

      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt=""
          className="h-48 w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-3xl bg-linen-card text-4xl">
          🫙
        </div>
      )}

      <div className="flex flex-col gap-1 rounded-3xl border border-linen-border bg-linen-card p-4 shadow-sm">
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Total across all shelves
        </h2>
        {loaded && totals.length === 0 && (
          <p className="text-sm text-charcoal-soft">None in stock.</p>
        )}
        {totals.map((total) => (
          <p key={total.label} className="font-display text-2xl font-semibold">
            {total.amount}{" "}
            <span className="font-label text-base font-normal text-charcoal-soft">
              {total.label}
            </span>
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-linen-border pt-6">
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Breakdown
        </h2>
        <ul className="flex flex-col gap-1">
          {breakdown.map((row) => (
            <li
              key={row.entryId}
              className="flex items-center justify-between rounded-2xl px-2 py-2"
            >
              <span className="text-sm">
                {row.locationName} · {row.roomName} · {row.shelfName}
              </span>
              <span className="font-label text-xs text-charcoal-soft">
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
