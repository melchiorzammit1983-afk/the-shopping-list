"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  loginWithMobile: (
    mobile: string
  ) => Promise<{ found: boolean; error: string | null }>;
  signUp: (fields: {
    name: string;
    surname: string;
    mobile: string;
    email: string;
  }) => Promise<{ error: string | null }>;
};

const inputClass =
  "rounded-lg border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-white/5 dark:focus:border-white/30";

export function LoginOrSignUp({ loginWithMobile, signUp }: Props) {
  const [mobile, setMobile] = useState("");
  const [needsSignUp, setNeedsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleMobileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mobile.trim()) return;
    setPending(true);
    setError("");
    const result = await loginWithMobile(mobile);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (!result.found) setNeedsSignUp(true);
  }

  async function handleSignUpSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await signUp({ name, surname, mobile, email });
    setPending(false);
    if (result.error) setError(result.error);
  }

  if (needsSignUp) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
        <header>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            No account found for {mobile}. Fill in a few details to create
            one.
          </p>
        </header>
        <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            className={inputClass}
          />
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Surname"
            className={inputClass}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={inputClass}
          />
          <input
            type="tel"
            value={mobile}
            disabled
            className={`${inputClass} opacity-60`}
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </form>
        <button
          onClick={() => {
            setNeedsSignUp(false);
            setError("");
          }}
          className="text-sm text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
        >
          Wrong number? Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Household</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Enter your mobile number to continue.
        </p>
      </header>
      <form onSubmit={handleMobileSubmit} className="flex flex-col gap-3">
        <input
          type="tel"
          required
          autoFocus
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile number"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Checking…" : "Continue"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
