"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";

export function SignIn() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setErrorMessage(error);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-3 px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          We sent a sign-in link to {email}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Household</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Sign in with your email to continue.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send sign-in link"}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
}
