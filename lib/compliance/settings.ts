import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const WARNING_RESTRICTED_DTC_KEY = "warning_restricted_dtc";
export const WARNING_PICKUP_ONLY_KEY = "warning_pickup_only";

const PLACEHOLDER_WARNING =
  "[INSERT ATTORNEY-APPROVED WARNING LANGUAGE HERE before this product goes live for real sale. This placeholder is intentional — do not treat it as compliant copy.]";

// Centrally-configured warning-label text, rendered automatically on
// qualifying product pages (never hand-edited per page). Defaults to an
// obvious placeholder since real legal warning language must come from the
// business's attorney, not be invented here.
export async function getComplianceSetting(key: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return PLACEHOLDER_WARNING;

  const { data } = await supabase.from("compliance_settings").select("value").eq("key", key).maybeSingle();
  return data?.value?.trim() ? data.value : PLACEHOLDER_WARNING;
}

export async function setComplianceSetting(
  key: string,
  value: string,
  staffUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "Supabase isn't configured." };

  const { error } = await supabase
    .from("compliance_settings")
    .upsert({ key, value, updated_by: staffUserId, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
