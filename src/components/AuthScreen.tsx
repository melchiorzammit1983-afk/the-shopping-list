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
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          You&apos;re in
        </h1>
        <p className="text-sm text-charcoal-soft">
          Account created — continue below.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Welcome back" : "Let's get you set up"}
        </h1>
        <p className="mt-1 text-sm text-charcoal-soft">
          {mode === "sign-in"
            ? "Enter your email and password to continue."
            : "Create an account to start stocking the shelves."}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-3xl border border-linen-border bg-linen-card p-5 shadow-sm"
      >
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-2xl border border-linen-border bg-linen px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-2xl border border-linen-border bg-linen px-4 py-2.5 text-sm outline-none placeholder:text-charcoal-soft/60 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-herb px-4 py-2.5 text-sm font-semibold text-linen-card shadow-sm transition-colors hover:bg-herb-dark disabled:opacity-50"
        >
          {pending
            ? "Working…"
            : mode === "sign-in"
              ? "Log in"
              : "Create account"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>

      <button
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setError("");
        }}
        className="font-label text-xs uppercase tracking-wide text-charcoal-soft transition-colors hover:text-herb"
      >
        {mode === "sign-in"
          ? "Need an account? Sign up"
          : "Already have an account? Log in"}
      </button>
    </div>
  );
}
