"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
  }, []);

  return { session, user: session?.user ?? null, loaded, signInWithEmail, signOut };
}
