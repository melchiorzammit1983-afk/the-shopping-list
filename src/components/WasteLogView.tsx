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
            className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            ← Locations
          </button>
          <h1 className="text-2xl font-semibold">Waste Log</h1>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyBin}
            disabled={pending}
            className="mt-1 text-xs text-black/40 hover:text-red-600 disabled:opacity-30 dark:text-white/40 dark:hover:text-red-400"
          >
            Empty Bin
          </button>
        )}
      </header>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loaded && entries.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          Nothing wasted yet — the fridge is behaving.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
          >
            <div className="flex flex-col">
              <span className="text-sm">
                {entry.item.name}
                <span className="ml-2 text-xs text-black/40 dark:text-white/40">
                  {entry.quantity}
                  {entry.unit ? ` ${entry.unit}` : ""}
                </span>
              </span>
              <span className="text-xs text-black/40 dark:text-white/40">
                {wasteReasonLabel(entry.reason)} ·{" "}
                {new Date(entry.removed_at).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
