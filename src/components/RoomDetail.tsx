"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useShelves } from "@/hooks/useShelves";
import { WASTE_REASONS } from "@/lib/wasteReasons";
import type { Room } from "@/types/room";
import type { Shelf } from "@/types/shelf";

type Props = {
  room: Room;
  userId: string;
  onBack: () => void;
  onSelectShelf: (shelf: Shelf) => void;
};

export function RoomDetail({ room, userId, onBack, onSelectShelf }: Props) {
  const { shelves, loaded, createShelf, renameShelf, deleteShelf, emptyShelf } =
    useShelves(room.id);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [blockedId, setBlockedId] = useState<string | null>(null);
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

  async function handleRename(shelf: Shelf) {
    const next = window.prompt("Rename shelf", shelf.name);
    if (next === null) return;
    setError("");
    const result = await renameShelf(shelf.id, next);
    if (result.error) setError(result.error);
  }

  async function handleDelete(shelf: Shelf) {
    if (!window.confirm(`Delete "${shelf.name}"?`)) return;
    setError("");
    const result = await deleteShelf(shelf.id);
    if (result.error) {
      setBlockedId(shelf.id);
      setError(result.error);
      return;
    }
  }

  async function handleEmptyAndDelete(shelf: Shelf, reason: string) {
    setError("");
    const emptyResult = await emptyShelf(shelf.id, reason, userId);
    if (emptyResult.error) {
      setError(emptyResult.error);
      return;
    }
    const deleteResult = await deleteShelf(shelf.id);
    setBlockedId(null);
    if (deleteResult.error) setError(deleteResult.error);
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
          <li
            key={shelf.id}
            className="flex flex-col gap-2 rounded-lg px-2 py-2 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectShelf(shelf)}
                className="flex-1 text-left text-sm"
              >
                {shelf.name}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleRename(shelf)}
                  className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(shelf)}
                  className="text-xs text-black/40 hover:text-red-600 dark:text-white/40 dark:hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>

            {blockedId === shelf.id && (
              <div className="flex flex-col gap-2 rounded-lg bg-black/[.03] p-2 dark:bg-white/[.05]">
                <p className="text-xs text-black/50 dark:text-white/50">
                  This shelf has items on it — remove those first, or empty
                  it into the waste log and take the shelf with it.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-black/40 dark:text-white/40">
                    Empty and send to the trash bin:
                  </span>
                  {WASTE_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => handleEmptyAndDelete(shelf, reason.value)}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/[.05] dark:border-white/15 dark:hover:bg-white/[.08]"
                    >
                      {reason.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBlockedId(null)}
                    className="text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
                  >
                    Never mind
                  </button>
                </div>
              </div>
            )}
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
