"use client";

import { useAuth } from "@/hooks/useAuth";
import { AuthScreen } from "@/components/AuthScreen";

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
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-2xl font-semibold">You&apos;re logged in</h1>
      <p className="text-sm text-black/50 dark:text-white/50">{user.email}</p>
      <p className="text-sm text-black/40 dark:text-white/40">
        Locations screen coming next.
      </p>
      <button
        onClick={signOut}
        className="mx-auto text-sm text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
      >
        Log out
      </button>
    </div>
  );
}
