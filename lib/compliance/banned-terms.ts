import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { BannedTerm } from "@/lib/types";

type BannedTermRow = {
  id: string;
  phrase: string;
  category: BannedTerm["category"];
  severity: BannedTerm["severity"];
  notes: string;
};

function mapRow(row: BannedTermRow): BannedTerm {
  return { id: row.id, phrase: row.phrase, category: row.category, severity: row.severity, notes: row.notes };
}

export async function getBannedTerms(): Promise<BannedTerm[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("content_banned_terms")
    .select("id, phrase, category, severity, notes")
    .order("category");

  if (error || !data) return [];
  return (data as BannedTermRow[]).map(mapRow);
}

export async function addBannedTerm(input: {
  phrase: string;
  category: BannedTerm["category"];
  severity: BannedTerm["severity"];
  notes: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "Supabase isn't configured." };

  const { error } = await supabase.from("content_banned_terms").insert({
    phrase: input.phrase,
    category: input.category,
    severity: input.severity,
    notes: input.notes,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteBannedTerm(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "Supabase isn't configured." };

  const { error } = await supabase.from("content_banned_terms").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
