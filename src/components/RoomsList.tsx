"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRooms } from "@/hooks/useRooms";
import type { Location } from "@/types/location";
import type { Room } from "@/types/room";

type Props = {
  location: Location;
  onBack: () => void;
  onSelectRoom: (room: Room) => void;
};

export function RoomsList({ location, onBack, onSelectRoom }: Props) {
  const { rooms, loaded, createRoom } = useRooms(location.id);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <button
          onClick={onBack}
          className="mb-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
        >
          ← Locations
        </button>
        <h1 className="text-2xl font-semibold">{location.name}</h1>
      </header>

      {loaded && rooms.length === 0 && (
        <p className="text-sm text-black/40 dark:text-white/40">
          No rooms yet. Add one below.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {rooms.map((room) => (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onSelectRoom(room)}
              className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              {room.name}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/15"
      >
        <h2 className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Add a room
        </h2>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Kitchen"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add room"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
