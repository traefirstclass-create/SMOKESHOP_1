"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/server-auth";
import { markItemPickedUp } from "@/lib/compliance/orders";

export async function markPickedUpAction(orderItemId: string): Promise<{ success: boolean; error?: string }> {
  const staff = await requireStaff();
  const result = await markItemPickedUp(orderItemId, staff.userId);
  if (result.success) revalidatePath("/admin/pickup-orders");
  return result;
}
