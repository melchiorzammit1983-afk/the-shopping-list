"use client";

import { useAppUser } from "@/hooks/useAppUser";
import { useHousehold } from "@/hooks/useHousehold";
import { LoginOrSignUp } from "@/components/LoginOrSignUp";
import { HouseholdSetup } from "@/components/HouseholdSetup";
import { InventoryApp } from "@/components/InventoryApp";

export default function Home() {
  const {
    user,
    loaded: userLoaded,
    loginWithMobile,
    signUp,
    logOut,
  } = useAppUser();
  const displayName = user ? `${user.name} ${user.surname}`.trim() : null;
  const {
    household,
    loaded: householdLoaded,
    createHousehold,
    joinHousehold,
    leaveHousehold,
  } = useHousehold(displayName);

  if (!userLoaded) return null;
  if (!user) {
    return (
      <LoginOrSignUp loginWithMobile={loginWithMobile} signUp={signUp} />
    );
  }
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
      identityName={displayName ?? user.name}
      onLeaveHousehold={leaveHousehold}
      onLogOut={logOut}
    />
  );
}
