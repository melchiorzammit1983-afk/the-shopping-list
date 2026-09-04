import { createClient } from "@supabase/supabase-js";
import { lookupExternalProduct } from "@/lib/productLookup";

export const runtime = "nodejs";

async function isAuthenticated(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !supabaseAnonKey) return false;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  return !error && Boolean(data.user);
}

export async function GET(request: Request) {
  if (!(await isAuthenticated(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const barcode = new URL(request.url).searchParams.get("barcode") ?? "";
  const result = await lookupExternalProduct(barcode);
  const status = result.status === "invalid" ? 400 : result.status === "unavailable" ? 503 : 200;

  return Response.json(result, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
