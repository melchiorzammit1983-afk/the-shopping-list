export type Household = {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
};

export type HouseholdMember = {
  id: string;
  household_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
};
