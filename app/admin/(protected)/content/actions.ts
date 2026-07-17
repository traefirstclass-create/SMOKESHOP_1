"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/server-auth";
import { addBannedTerm, deleteBannedTerm } from "@/lib/compliance/banned-terms";
import { setComplianceSetting } from "@/lib/compliance/settings";
import type { BannedTerm } from "@/lib/types";

export async function addBannedTermAction(input: {
  phrase: string;
  category: BannedTerm["category"];
  severity: BannedTerm["severity"];
  notes: string;
}) {
  await requireStaff();
  const result = await addBannedTerm(input);
  if (result.success) revalidatePath("/admin/content");
  return result;
}

export async function deleteBannedTermAction(id: string) {
  await requireStaff();
  const result = await deleteBannedTerm(id);
  if (result.success) revalidatePath("/admin/content");
  return result;
}

export async function saveWarningTextAction(key: string, value: string) {
  const staff = await requireStaff();
  const result = await setComplianceSetting(key, value, staff.userId);
  if (result.success) revalidatePath("/admin/content");
  return result;
}
