import type { Item } from "@/types/item";

export type StockEntryWithItem = {
  id: string;
  shelf_id: string;
  item_id: string;
  quantity: number;
  unit: string | null;
  created_at: string;
  updated_at: string;
  item: Item;
};
