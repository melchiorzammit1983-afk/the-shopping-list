"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  signUpWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
};

export function AuthScreen({ signUpWithPassword, signInWithPassword }: Props) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result =
      mode === "sign-in"
        ? await signInWithPassword(email.trim(), password)
        : await signUpWithPassword(email.trim(), password);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "sign-up") setSignedUp(true);
  }

  if (signedUp) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-3 px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold">Account created</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          You&apos;re signed in — continue below.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">
          {mode === "sign-in" ? "Log in" : "Sign up"}
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {mode === "sign-in"
            ? "Enter your email and password to continue."
            : "Create an account to get started."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending
            ? "Working…"
            : mode === "sign-in"
              ? "Log in"
              : "Create account"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>

      <button
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setError("");
        }}
        className="text-sm text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
      >
        {mode === "sign-in"
          ? "Need an account? Sign up"
          : "Already have an account? Log in"}
      </button>
    </div>
  );
}
