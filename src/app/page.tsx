"use client";

import { useIdentity } from "@/hooks/useIdentity";
import { useHousehold } from "@/hooks/useHousehold";
import { WhoAreYou } from "@/components/WhoAreYou";
import { HouseholdSetup } from "@/components/HouseholdSetup";
import { InventoryApp } from "@/components/InventoryApp";

export default function Home() {
  const { name, loaded: identityLoaded, setIdentity } = useIdentity();
  const {
    household,
    loaded: householdLoaded,
    createHousehold,
    joinHousehold,
    leaveHousehold,
  } = useHousehold(name);

  if (!identityLoaded) return null;
  if (!name) return <WhoAreYou setIdentity={setIdentity} />;
  if (!householdLoaded) return null;
  if (!household) {
    return (
      <HouseholdSetup
        createHousehold={createHousehold}
        joinHousehold={joinHousehold}
      />
    );
  }

  return (
    <InventoryApp
      household={household}
      identityName={name}
      onLeaveHousehold={leaveHousehold}
    />
  );
}
