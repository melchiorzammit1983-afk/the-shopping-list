"use client";

import { useAuth } from "@/hooks/useAuth";
import { AuthScreen } from "@/components/AuthScreen";
import { LocationsList } from "@/components/LocationsList";

export default function Home() {
  const { user, loaded, signUpWithPassword, signInWithPassword, signOut } =
    useAuth();

  if (!loaded) return null;
  if (!user) {
    return (
      <AuthScreen
        signUpWithPassword={signUpWithPassword}
        signInWithPassword={signInWithPassword}
      />
    );
  }

  return (
    <LocationsList
      userId={user.id}
      userEmail={user.email}
      onLogOut={signOut}
    />
  );
}
