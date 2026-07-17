"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/server-auth";
import { updateProductCompliance, type ComplianceReviewUpdate } from "@/lib/compliance/products";

export async function saveProductComplianceAction(
  productId: string,
  update: ComplianceReviewUpdate,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const staff = await requireStaff();

  if (!reason.trim()) {
    return { success: false, error: "A reason is required for the audit log." };
  }

  const result = await updateProductCompliance(productId, update, staff.userId, reason.trim());
  if (result.success) {
    revalidatePath("/admin/products");
    revalidatePath("/admin");
  }
  return result;
}
