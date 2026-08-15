import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// Lazily instantiated so importing this module never throws during Next.js's
// build-time prerendering, which would happen if this ran at module scope.
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
