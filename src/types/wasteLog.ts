export type WasteLogEntry = {
  id: string;
  item_id: string;
  quantity: number;
  unit: string | null;
  reason: string;
  note: string | null;
  removed_by: string;
  removed_at: string;
  item: { name: string };
};
