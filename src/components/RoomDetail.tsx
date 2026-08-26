"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useShelves } from "@/hooks/useShelves";
import { WASTE_REASONS } from "@/lib/wasteReasons";
import { SHELF_TYPES, shelfTypeInfo } from "@/lib/shelfTypes";
import type { Room } from "@/types/room";
import type { Shelf } from "@/types/shelf";

type Props = {
  room: Room;
  userId: string;
  onBack: () => void;
  onSelectShelf: (shelf: Shelf) => void;
};

export function RoomDetail({ room, userId, onBack, onSelectShelf }: Props) {
  const {
    shelves,
    loaded,
    createShelf,
    renameShelf,
    deleteShelf,
    emptyShelf,
    setShelfType,
  } = useShelves(room.id);
  const [name, setName] = useState("");
  const [newType, setNewType] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [typePickerId, setTypePickerId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createShelf(name, newType);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setNewType(null);
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

  async function handleSetType(shelf: Shelf, type: string | null) {
    setError("");
    const result = await setShelfType(shelf.id, type);
    setTypePickerId(null);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
        >
          ← Rooms
        </button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {room.name}
        </h1>
      </header>

      {loaded && shelves.length === 0 && (
        <p className="text-sm text-charcoal-soft">
          No shelves yet. Add one below.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {shelves.map((shelf) => {
          const typeInfo = shelfTypeInfo(shelf.type);
          return (
            <li
              key={shelf.id}
              className="flex flex-col gap-2 rounded-3xl border border-linen-border bg-linen-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectShelf(shelf)}
                    className="text-left font-display text-lg font-semibold"
                  >
                    {shelf.name}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTypePickerId(
                        typePickerId === shelf.id ? null : shelf.id
                      )
                    }
                    className={`font-label rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide transition-opacity hover:opacity-80 ${
                      typeInfo
                        ? `${typeInfo.bg} ${typeInfo.on}`
                        : "bg-no-expiry-tint text-charcoal-soft"
                    }`}
                  >
                    {typeInfo ? `${typeInfo.emoji} ${typeInfo.label}` : "Set type"}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleRename(shelf)}
                    className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(shelf)}
                    className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {typePickerId === shelf.id && (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-linen p-3">
                  {SHELF_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleSetType(shelf, t.value)}
                      className={`font-label rounded-full px-3 py-1 text-xs uppercase tracking-wide transition-opacity hover:opacity-80 ${t.bg} ${t.on}`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSetType(shelf, null)}
                    className="font-label rounded-full bg-no-expiry-tint px-3 py-1 text-xs uppercase tracking-wide text-charcoal-soft"
                  >
                    None
                  </button>
                </div>
              )}

              {blockedId === shelf.id && (
                <div className="flex flex-col gap-2 rounded-2xl bg-expired-tint p-3">
                  <p className="text-xs text-charcoal-soft">
                    This shelf has items on it — remove those first, or empty
                    it into the waste log and take the shelf with it.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-label text-xs uppercase tracking-wide text-charcoal-soft">
                      Empty and send to the trash bin:
                    </span>
                    {WASTE_REASONS.map((reason) => (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => handleEmptyAndDelete(shelf, reason.value)}
                        className="rounded-full border border-linen-border bg-linen-card px-3 py-1 text-xs font-medium transition-colors hover:bg-herb-tint"
                      >
                        {reason.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setBlockedId(null)}
                      className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-charcoal"
                    >
                      Never mind
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-linen-border pt-6"
      >
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Add a shelf
        </h2>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Top shelf"
          className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <div className="flex flex-wrap items-center gap-2">
          {SHELF_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setNewType(newType === t.value ? null : t.value)}
              className={`font-label rounded-full px-3 py-1 text-xs uppercase tracking-wide transition-opacity ${
                newType === t.value
                  ? `${t.bg} ${t.on}`
                  : "border border-linen-border bg-linen-card text-charcoal-soft hover:opacity-80"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add shelf"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}
