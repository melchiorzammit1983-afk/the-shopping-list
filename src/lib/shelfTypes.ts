export const SHELF_TYPES = [
  { value: "fridge", label: "Fridge", emoji: "🧊", bg: "bg-fridge", on: "text-fridge-on" },
  { value: "freezer", label: "Freezer", emoji: "❄️", bg: "bg-freezer", on: "text-freezer-on" },
  { value: "pantry", label: "Pantry", emoji: "🫙", bg: "bg-pantry", on: "text-pantry-on" },
  { value: "laundry", label: "Laundry", emoji: "🧺", bg: "bg-laundry", on: "text-laundry-on" },
] as const;

export type ShelfType = (typeof SHELF_TYPES)[number]["value"];

export function shelfTypeInfo(type: string | null) {
  return SHELF_TYPES.find((t) => t.value === type) ?? null;
}
