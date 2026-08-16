"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { AppUser } from "@/types/user";

const STORAGE_KEY = "app_user:id";

function normalizeMobile(mobile: string) {
  return mobile.trim();
}

export function useAppUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadById = useCallback(async (id: string) => {
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) {
      setUser(data);
      return true;
    }
    return false;
  }, []);

  // localStorage isn't available during SSR, so the stored user ID is read
  // and resolved on mount rather than in the initial render.
  useEffect(() => {
    const storedId = window.localStorage.getItem(STORAGE_KEY);
    if (!storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true);
      return;
    }
    loadById(storedId).then((found) => {
      if (!found) window.localStorage.removeItem(STORAGE_KEY);
      setLoaded(true);
    });
  }, [loadById]);

  const loginWithMobile = useCallback(async (mobile: string) => {
    const normalized = normalizeMobile(mobile);
    if (!normalized) {
      return { found: false as const, error: "Enter a mobile number" };
    }
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("*")
      .eq("mobile_number", normalized)
      .maybeSingle();
    if (error) return { found: false as const, error: error.message };
    if (!data) return { found: false as const, error: null };
    window.localStorage.setItem(STORAGE_KEY, data.id);
    setUser(data);
    return { found: true as const, error: null };
  }, []);

  const signUp = useCallback(
    async (fields: {
      name: string;
      surname: string;
      mobile: string;
      email: string;
    }) => {
      const name = fields.name.trim();
      const surname = fields.surname.trim();
      const mobile = normalizeMobile(fields.mobile);
      const email = fields.email.trim();
      if (!name || !mobile) {
        return { error: "Name and mobile number are required" };
      }

      const { data, error } = await getSupabaseClient()
        .from("users")
        .insert({ name, surname, mobile_number: mobile, email })
        .select("*")
        .single();
      if (error || !data) {
        return { error: error?.message ?? "Couldn't create account" };
      }
      window.localStorage.setItem(STORAGE_KEY, data.id);
      setUser(data);
      return { error: null };
    },
    []
  );

  const logOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loaded, loginWithMobile, signUp, logOut };
}
