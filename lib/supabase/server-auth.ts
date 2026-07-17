import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// Cookie-bound server client for reading the current staff session inside
// Server Components / Route Handlers under app/admin/.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase isn't configured — set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render (not a Route Handler) —
          // middleware.ts already refreshes the session cookie per request,
          // so this is safe to ignore.
        }
      },
    },
  });
}

export type StaffProfile = {
  userId: string;
  displayName: string;
  role: "owner" | "staff";
  email: string | null;
};

// Returns the logged-in staff member, or null if there's no session or the
// session's user has no staff_profiles row (i.e. authenticated but not
// staff — e.g. a future Trade customer account).
export async function getCurrentStaff(): Promise<StaffProfile | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("staff_profiles")
    .select("user_id, display_name, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    userId: data.user_id,
    displayName: data.display_name,
    role: data.role,
    email: user.email ?? null,
  };
}

// Use at the top of every app/admin/** page (except /admin/login).
export async function requireStaff(): Promise<StaffProfile> {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}
