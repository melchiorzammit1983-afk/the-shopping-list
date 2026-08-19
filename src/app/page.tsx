"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthScreen } from "@/components/AuthScreen";
import { LocationsList } from "@/components/LocationsList";
import { LocationDetail } from "@/components/LocationDetail";
import type { Location } from "@/types/location";

export default function Home() {
  const { user, loaded, signUpWithPassword, signInWithPassword, signOut } =
    useAuth();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  if (!loaded) return null;
  if (!user) {
    return (
      <AuthScreen
        signUpWithPassword={signUpWithPassword}
        signInWithPassword={signInWithPassword}
      />
    );
  }

  if (selectedLocation) {
    return (
      <LocationDetail
        location={selectedLocation}
        onBack={() => setSelectedLocation(null)}
      />
    );
  }

  return (
    <LocationsList
      userId={user.id}
      userEmail={user.email}
      onLogOut={signOut}
      onSelectLocation={setSelectedLocation}
    />
  );
}
