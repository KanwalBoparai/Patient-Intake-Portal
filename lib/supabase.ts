import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only: uses the service-role key. Never import from client code.
let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — fill in .env (see README)."
      );
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
