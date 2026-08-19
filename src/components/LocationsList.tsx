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
};

export function LocationsList({
  userId,
  userEmail,
  onLogOut,
  onSelectLocation,
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
          <h1 className="text-2xl font-semibold">Your locations</h1>
          {userEmail && (
            <p className="text-sm text-black/50 dark:text-white/50">
              {userEmail}
            </p>
          )}
        </div>
        <button
          onClick={onLogOut}
          className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
        >
          Log out
        </button>
      </header>

      {loaded && locations.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          You don&apos;t have any locations yet. Add one below.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {locations.map((location) => (
          <li key={location.id}>
            <button
              type="button"
              onClick={() => onSelectLocation(location)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              <span className="text-sm">{location.name}</span>
              {location.type && (
                <span className="text-xs text-black/40 dark:text-white/40">
                  {location.type}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/15"
      >
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Add a location
        </h2>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Home"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type, e.g. household, shop, restaurant (optional)"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add location"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
