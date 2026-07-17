import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { logComplianceChange } from "@/lib/compliance/audit-log";
import type { TradeApplication } from "@/lib/types";

type TradeApplicationRow = {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  resale_cert_number: string;
  business_license_number: string;
  notes: string;
  status: TradeApplication["status"];
  created_at: string;
};

function mapRow(row: TradeApplicationRow): TradeApplication {
  return {
    id: row.id,
    businessName: row.business_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    resaleCertNumber: row.resale_cert_number,
    businessLicenseNumber: row.business_license_number,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
}

// Public-facing: the /trade/apply form writes here directly (no login yet —
// see COMPLIANCE.md "Wholesale / Trade program" for why this is scoped as a
// manual-follow-up intake rather than a self-serve account system today).
export async function createTradeApplication(input: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  resaleCertNumber: string;
  businessLicenseNumber: string;
  notes: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "This isn't accepting applications right now." };

  const { error } = await supabase.from("trade_applications").insert({
    business_name: input.businessName,
    contact_name: input.contactName,
    email: input.email,
    phone: input.phone,
    resale_cert_number: input.resaleCertNumber,
    business_license_number: input.businessLicenseNumber,
    notes: input.notes,
    status: "pending",
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getTradeApplications(): Promise<TradeApplication[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("trade_applications")
    .select(
      "id, business_name, contact_name, email, phone, resale_cert_number, business_license_number, notes, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as TradeApplicationRow[]).map(mapRow);
}

export async function reviewTradeApplication(
  id: string,
  status: "approved" | "rejected",
  staffUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "Supabase isn't configured." };

  const { error } = await supabase
    .from("trade_applications")
    .update({ status, reviewed_by: staffUserId, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logComplianceChange({
    entityType: "trade_application",
    entityId: id,
    action: `application_${status}`,
    newValue: { status },
    reason: `Trade application marked ${status}`,
    performedBy: staffUserId,
  });

  return { success: true };
}
