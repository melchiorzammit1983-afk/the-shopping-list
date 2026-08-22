"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useShelves } from "@/hooks/useShelves";
import type { Room } from "@/types/room";
import type { Shelf } from "@/types/shelf";

type Props = {
  room: Room;
  onBack: () => void;
  onSelectShelf: (shelf: Shelf) => void;
};

export function RoomDetail({ room, onBack, onSelectShelf }: Props) {
  const { shelves, loaded, createShelf } = useShelves(room.id);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createShelf(name);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
        >
          ← Rooms
        </button>
        <h1 className="text-2xl font-semibold">{room.name}</h1>
      </header>

      {loaded && shelves.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          No shelves yet. Add one below.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {shelves.map((shelf) => (
          <li key={shelf.id}>
            <button
              type="button"
              onClick={() => onSelectShelf(shelf)}
              className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              {shelf.name}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/15"
      >
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Add a shelf
        </h2>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Top shelf"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add shelf"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
