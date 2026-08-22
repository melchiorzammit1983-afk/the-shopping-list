export type Recipe = {
  id: string;
  name: string;
  method: string;
  servings: number | null;
  is_public: boolean;
  image_url: string | null;
  created_by: string;
  created_at: string;
};
