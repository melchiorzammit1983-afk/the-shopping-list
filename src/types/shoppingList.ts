export const SHOPPING_LIST_STATUSES = [
  "planning",
  "shopping",
  "finished",
] as const;

export type ShoppingListStatus = (typeof SHOPPING_LIST_STATUSES)[number];

export type ShoppingList = {
  id: string;
  name: string;
  status: ShoppingListStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
};
