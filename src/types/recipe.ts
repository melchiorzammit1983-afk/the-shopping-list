export type Recipe = {
  id: string;
  name: string;
  method: string;
  servings: number | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
};
