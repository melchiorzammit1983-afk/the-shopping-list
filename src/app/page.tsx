"use client";

import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import { SignIn } from "@/components/SignIn";
import { HouseholdSetup } from "@/components/HouseholdSetup";
import { InventoryApp } from "@/components/InventoryApp";

export default function Home() {
  const { user, loaded: authLoaded } = useAuth();
  const { household, loaded: householdLoaded } = useHousehold();

  if (!authLoaded) return null;
  if (!user) return <SignIn />;
  if (!householdLoaded) return null;
  if (!household) return <HouseholdSetup />;

  return <InventoryApp household={household} />;
}
