"use client";

import { useState } from "react";
import { useWasteLog } from "@/hooks/useWasteLog";
import { wasteReasonLabel } from "@/lib/wasteReasons";

type Props = {
  userId: string;
  onBack: () => void;
};

export function WasteLogView({ userId, onBack }: Props) {
  const { entries, loaded, clearAll } = useWasteLog(userId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleEmptyBin() {
    if (
      !window.confirm(
        `Clear all ${entries.length} entries from the Waste Log? This can't be undone, and items already removed from stock will not be restored.`
      )
    )
      return;
    setPending(true);
    setError("");
    const result = await clearAll(userId);
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
          >
            ← Locations
          </button>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Waste Log
          </h1>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyBin}
            disabled={pending}
            className="font-label mt-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-danger disabled:opacity-30"
          >
            Empty Bin
          </button>
        )}
      </header>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loaded && entries.length === 0 && (
        <p className="text-sm text-charcoal-soft">
          Nothing wasted yet — the fridge is behaving.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between rounded-2xl border border-linen-border bg-linen-card px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-sm">
                {entry.item.name}
                <span className="font-label ml-2 text-xs text-charcoal-soft">
                  {entry.quantity}
                  {entry.unit ? ` ${entry.unit}` : ""}
                </span>
              </span>
              <span className="text-xs text-charcoal-soft">
                {new Date(entry.removed_at).toLocaleDateString()}
              </span>
            </div>
            <span className="font-label rounded-full bg-expired-tint px-2.5 py-1 text-[10px] uppercase tracking-wide text-expired">
              {wasteReasonLabel(entry.reason)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
