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

  const signUpWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await getSupabaseClient().auth.signUp({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    []
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loaded,
    signUpWithPassword,
    signInWithPassword,
    signOut,
  };
}
