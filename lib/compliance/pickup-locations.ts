import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { PickupLocation } from "@/lib/types";

type PickupLocationRow = {
  id: string;
  name: string;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  is_active: boolean;
};

function mapRow(row: PickupLocationRow): PickupLocation {
  return {
    id: row.id,
    name: row.name,
    addressLine1: row.address_line1,
    city: row.city,
    state: row.state,
    zip: row.zip,
    isActive: row.is_active,
  };
}

// Read-only for now — pickup_locations is edited directly in Supabase until
// there's more than one store (see COMPLIANCE.md). Public-safe: only
// is_active=true locations are ever returned (also enforced by RLS).
export async function getActivePickupLocations(): Promise<PickupLocation[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pickup_locations")
    .select("id, name, address_line1, city, state, zip, is_active")
    .eq("is_active", true)
    .order("name");

  if (error || !data) return [];
  return (data as PickupLocationRow[]).map(mapRow);
}
