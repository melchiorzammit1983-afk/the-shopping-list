"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useLocations } from "@/hooks/useLocations";

import type { Location } from "@/types/location";

type Props = {
  userId: string;
  userEmail: string | undefined;
  onLogOut: () => void;
  onSelectLocation: (location: Location) => void;
  onGoToRecipes: () => void;
  onGoToWasteLog: () => void;
};

export function LocationsList({
  userId,
  userEmail,
  onLogOut,
  onSelectLocation,
  onGoToRecipes,
  onGoToWasteLog,
}: Props) {
  const { locations, loaded, createLocation } = useLocations(userId);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createLocation(name, type);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setType("");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Your kitchen
          </h1>
          {userEmail && (
            <p className="mt-1 text-sm text-charcoal-soft">{userEmail}</p>
          )}
        </div>
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={onGoToRecipes}
            className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
          >
            Recipes
          </button>
          <button
            onClick={onGoToWasteLog}
            className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
          >
            Waste Log
          </button>
          <button
            onClick={onLogOut}
            className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-danger"
          >
            Log out
          </button>
        </div>
      </header>

      {loaded && locations.length === 0 && (
        <p className="text-sm text-charcoal-soft">
          No locations yet — add your first one below and start stocking up.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {locations.map((location) => (
          <li key={location.id}>
            <button
              type="button"
              onClick={() => onSelectLocation(location)}
              className="flex w-full items-center justify-between rounded-3xl border border-linen-border bg-linen-card px-5 py-4 text-left shadow-sm transition-colors hover:border-herb/40 hover:bg-herb-tint"
            >
              <span className="font-display text-lg font-semibold">
                {location.name}
              </span>
              {location.type && (
                <span className="font-label text-xs uppercase tracking-wide text-charcoal-soft">
                  {location.type}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-linen-border pt-6"
      >
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Add a location
        </h2>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Home"
          className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type, e.g. household, shop, restaurant (optional)"
          className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add location"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}
