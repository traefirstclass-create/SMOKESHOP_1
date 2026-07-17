import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { logComplianceChange } from "@/lib/compliance/audit-log";

export type PendingPickupItem = {
  orderItemId: string;
  orderId: string;
  productName: string;
  quantity: number;
  customerName: string;
  email: string;
  buyerDob: string | null;
  pickupLocationName: string | null;
  createdAt: string;
};

// Manual joins (rather than PostgREST nested-select syntax) so this doesn't
// depend on foreign-key relationship names being exactly right in a live
// project — a few extra round trips, but robust.
export async function getPendingPickupItems(): Promise<PendingPickupItem[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data: itemRows } = await supabase
    .from("order_items")
    .select("id, order_id, product_name, quantity")
    .eq("fulfillment_type", "pickup")
    .is("picked_up_at", null);

  if (!itemRows || itemRows.length === 0) return [];

  const orderIds = [...new Set(itemRows.map((r) => r.order_id))];
  const { data: orderRows } = await supabase
    .from("orders")
    .select("id, customer_name, email, buyer_dob, pickup_location_id, created_at")
    .in("id", orderIds);

  const locationIds = [...new Set((orderRows ?? []).map((o) => o.pickup_location_id).filter(Boolean))];
  const { data: locationRows } =
    locationIds.length > 0
      ? await supabase.from("pickup_locations").select("id, name").in("id", locationIds)
      : { data: [] as { id: string; name: string }[] };

  const orderById = new Map((orderRows ?? []).map((o) => [o.id, o]));
  const locationById = new Map((locationRows ?? []).map((l) => [l.id, l.name]));

  return itemRows
    .map((item) => {
      const order = orderById.get(item.order_id);
      if (!order) return null;
      return {
        orderItemId: item.id,
        orderId: item.order_id,
        productName: item.product_name,
        quantity: item.quantity,
        customerName: order.customer_name,
        email: order.email,
        buyerDob: order.buyer_dob,
        pickupLocationName: order.pickup_location_id ? locationById.get(order.pickup_location_id) ?? null : null,
        createdAt: order.created_at,
      };
    })
    .filter((x): x is PendingPickupItem => x !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function markItemPickedUp(
  orderItemId: string,
  staffUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "Supabase isn't configured." };

  const { error } = await supabase
    .from("order_items")
    .update({
      picked_up_at: new Date().toISOString(),
      picked_up_verified_by: staffUserId,
      id_check_confirmed: true,
    })
    .eq("id", orderItemId);

  if (error) return { success: false, error: error.message };

  await logComplianceChange({
    entityType: "checkout",
    entityId: orderItemId,
    action: "pickup_completed",
    reason: "In-person ID check completed at handoff",
    performedBy: staffUserId,
  });

  return { success: true };
}
