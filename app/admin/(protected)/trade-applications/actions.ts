"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/server-auth";
import { reviewTradeApplication } from "@/lib/compliance/trade-applications";

export async function reviewTradeApplicationAction(
  id: string,
  status: "approved" | "rejected"
): Promise<{ success: boolean; error?: string }> {
  const staff = await requireStaff();
  const result = await reviewTradeApplication(id, status, staff.userId);
  if (result.success) revalidatePath("/admin/trade-applications");
  return result;
}
