"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRooms } from "@/hooks/useRooms";
import { WASTE_REASONS } from "@/lib/wasteReasons";
import type { Location } from "@/types/location";
import type { Room } from "@/types/room";

type Props = {
  location: Location;
  userId: string;
  onBack: () => void;
  onSelectRoom: (room: Room) => void;
};

export function RoomsList({ location, userId, onBack, onSelectRoom }: Props) {
  const { rooms, loaded, createRoom, renameRoom, deleteRoom, emptyRoom } =
    useRooms(location.id);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createRoom(name);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
  }

  async function handleRename(room: Room) {
    const next = window.prompt("Rename room", room.name);
    if (next === null) return;
    setError("");
    const result = await renameRoom(room.id, next);
    if (result.error) setError(result.error);
  }

  async function handleDelete(room: Room) {
    if (!window.confirm(`Delete "${room.name}"?`)) return;
    setError("");
    const result = await deleteRoom(room.id);
    if (result.error) {
      setBlockedId(room.id);
      setError(result.error);
      return;
    }
  }

  async function handleEmptyAndDelete(room: Room, reason: string) {
    setError("");
    const emptyResult = await emptyRoom(room.id, reason, userId);
    if (emptyResult.error) {
      setError(emptyResult.error);
      return;
    }
    const deleteResult = await deleteRoom(room.id);
    setBlockedId(null);
    if (deleteResult.error) setError(deleteResult.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="font-label mb-1 text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
        >
          ← Locations
        </button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {location.name}
        </h1>
      </header>

      {loaded && rooms.length === 0 && (
        <p className="text-sm text-charcoal-soft">
          No rooms yet. Add one below.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="flex flex-col gap-2 rounded-3xl border border-linen-border bg-linen-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectRoom(room)}
                className="flex-1 text-left font-display text-lg font-semibold"
              >
                {room.name}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleRename(room)}
                  className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(room)}
                  className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-danger"
                >
                  Delete
                </button>
              </div>
            </div>

            {blockedId === room.id && (
              <div className="flex flex-col gap-2 rounded-2xl bg-expired-tint p-3">
                <p className="text-xs text-charcoal-soft">
                  This room has shelves in it — remove those first, or empty
                  everything into the waste log and take the room with it.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label text-xs uppercase tracking-wide text-charcoal-soft">
                    Empty and send to the trash bin:
                  </span>
                  {WASTE_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => handleEmptyAndDelete(room, reason.value)}
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
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-linen-border pt-6"
      >
        <h2 className="font-label text-xs uppercase tracking-widest text-charcoal-soft">
          Add a room
        </h2>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Kitchen"
          className="rounded-2xl border border-linen-border bg-linen-card px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add room"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}
