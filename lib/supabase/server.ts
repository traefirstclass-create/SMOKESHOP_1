import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | null | undefined;

/**
 * Service-role Supabase client. Server-only — never import from client
 * components. Used to write orders. Returns null when not configured.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cachedAdminClient !== undefined) return cachedAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedAdminClient = null;
    return cachedAdminClient;
  }

  cachedAdminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedAdminClient;
}
