import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { logComplianceChange } from "@/lib/compliance/audit-log";
import { US_STATES } from "@/lib/data/us-states";
import type { StateRegistration } from "@/lib/types";

type StateRegistrationRow = {
  state: string;
  atf_registered: boolean;
  tax_registered: boolean;
  carrier_ready: boolean;
  notes: string;
  updated_at: string;
};

function mapRow(row: StateRegistrationRow): StateRegistration {
  return {
    state: row.state,
    atfRegistered: row.atf_registered,
    taxRegistered: row.tax_registered,
    carrierReady: row.carrier_ready,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

function emptyRegistration(state: string): StateRegistration {
  return { state, atfRegistered: false, taxRegistered: false, carrierReady: false, notes: "", updatedAt: "" };
}

export function isAllowlisted(reg: StateRegistration | undefined): boolean {
  return Boolean(reg?.atfRegistered && reg.taxRegistered && reg.carrierReady);
}

// Every US state + DC, merged with whatever rows exist in state_registrations
// — a state with no row yet is treated as fully unregistered (safe default).
export async function getAllStateRegistrations(): Promise<StateRegistration[]> {
  const supabase = getSupabaseAdminClient();
  const byState = new Map<string, StateRegistration>();

  if (supabase) {
    const { data } = await supabase
      .from("state_registrations")
      .select("state, atf_registered, tax_registered, carrier_ready, notes, updated_at");
    (data as StateRegistrationRow[] | null)?.forEach((row) => byState.set(row.state, mapRow(row)));
  }

  return US_STATES.map((s) => byState.get(s.code) ?? emptyRegistration(s.code));
}

// Used by the checkout API route — a lighter read for a single state.
export async function getStateRegistration(state: string): Promise<StateRegistration> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return emptyRegistration(state);

  const { data } = await supabase
    .from("state_registrations")
    .select("state, atf_registered, tax_registered, carrier_ready, notes, updated_at")
    .eq("state", state)
    .maybeSingle();

  return data ? mapRow(data as StateRegistrationRow) : emptyRegistration(state);
}

export async function upsertStateRegistration(
  state: string,
  update: { atfRegistered: boolean; taxRegistered: boolean; carrierReady: boolean; notes: string },
  staffUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "Supabase isn't configured." };

  const previous = await getStateRegistration(state);

  const { error } = await supabase.from("state_registrations").upsert({
    state,
    atf_registered: update.atfRegistered,
    tax_registered: update.taxRegistered,
    carrier_ready: update.carrierReady,
    notes: update.notes,
    updated_by: staffUserId,
    updated_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };

  await logComplianceChange({
    entityType: "state_registration",
    entityId: state,
    action: "registration_updated",
    previousValue: previous,
    newValue: update,
    reason: `State registration status updated for ${state}`,
    performedBy: staffUserId,
  });

  return { success: true };
}
