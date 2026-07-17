import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { ComplianceAuditLogEntry } from "@/lib/types";

type LogInput = {
  entityType: "product" | "checkout" | "state_registration" | "trade_application";
  entityId: string;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  performedBy?: string | null;
};

// Central write path for every compliance-relevant action: a SKU's category
// changing, every RESTRICTED_DTC/PICKUP_ONLY checkout, state-registration
// edits, and trade-application decisions. This table is what the monthly FL
// tobacco delivery-sale filing export (in /admin/audit-log) reads from.
export async function logComplianceChange(input: LogInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("compliance_audit_log").insert({
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    previous_value: input.previousValue ?? null,
    new_value: input.newValue ?? null,
    reason: input.reason ?? "",
    performed_by: input.performedBy ?? null,
  });
}

type AuditLogRow = {
  id: string;
  entity_type: ComplianceAuditLogEntry["entityType"];
  entity_id: string;
  action: string;
  previous_value: unknown;
  new_value: unknown;
  reason: string;
  performed_by: string | null;
  created_at: string;
};

function mapRow(row: AuditLogRow): ComplianceAuditLogEntry {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    previousValue: row.previous_value,
    newValue: row.new_value,
    reason: row.reason,
    performedBy: row.performed_by,
    createdAt: row.created_at,
  };
}

export async function getAuditLog(filters: {
  entityType?: ComplianceAuditLogEntry["entityType"];
  from?: string;
  to?: string;
}): Promise<ComplianceAuditLogEntry[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from("compliance_audit_log")
    .select("id, entity_type, entity_id, action, previous_value, new_value, reason, performed_by, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.entityType) query = query.eq("entity_type", filters.entityType);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as AuditLogRow[]).map(mapRow);
}
