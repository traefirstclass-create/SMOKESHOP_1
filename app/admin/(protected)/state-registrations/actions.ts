"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/server-auth";
import { upsertStateRegistration } from "@/lib/compliance/state-registrations";

export async function saveStateRegistrationAction(
  state: string,
  update: { atfRegistered: boolean; taxRegistered: boolean; carrierReady: boolean; notes: string }
): Promise<{ success: boolean; error?: string }> {
  const staff = await requireStaff();
  const result = await upsertStateRegistration(state, update, staff.userId);
  if (result.success) revalidatePath("/admin/state-registrations");
  return result;
}
