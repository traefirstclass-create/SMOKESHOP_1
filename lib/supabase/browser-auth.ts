import { createBrowserClient } from "@supabase/ssr";

// Cookie-syncing browser client for Supabase Auth flows (staff login). This
// is distinct from the plain anon client in lib/supabase/client.ts, which
// has no session/cookie awareness and is only used for public catalog reads.
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase isn't configured — set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient(url, anonKey);
}
