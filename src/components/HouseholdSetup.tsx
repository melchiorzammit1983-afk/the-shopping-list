"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  createHousehold: (name: string) => Promise<{ error: string | null }>;
  joinHousehold: (householdId: string) => Promise<{ error: string | null }>;
};

export function HouseholdSetup({ createHousehold, joinHousehold }: Props) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [householdId, setHouseholdId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result =
      mode === "create"
        ? await createHousehold(name)
        : await joinHousehold(householdId);
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Set up your household</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Create a new household, or join one you&apos;ve been invited to.
        </p>
      </header>

      <div className="flex gap-2 rounded-lg bg-black/[.04] p-1 dark:bg-white/[.06]">
        <button
          onClick={() => setMode("create")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "create"
              ? "bg-white shadow-sm dark:bg-black/40"
              : "text-black/50 dark:text-white/50"
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setMode("join")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "join"
              ? "bg-white shadow-sm dark:bg-black/40"
              : "text-black/50 dark:text-white/50"
          }`}
        >
          Join
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "create" ? (
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Household name, e.g. Flat 4B"
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
          />
        ) : (
          <input
            type="text"
            required
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
            placeholder="Household ID (ask a member for it)"
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
          />
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending
            ? "Working…"
            : mode === "create"
              ? "Create household"
              : "Join household"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
