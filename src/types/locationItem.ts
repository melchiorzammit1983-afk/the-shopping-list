import type { Item } from "@/types/item";

export type LocationItemWithDetails = {
  id: string;
  location_id: string;
  item_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  item: Item;
};
