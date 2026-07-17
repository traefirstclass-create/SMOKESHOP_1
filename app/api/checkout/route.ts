import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAllProducts } from "@/lib/catalog";
import { chargeCard, isAuthorizeNetConfigured } from "@/lib/authorize-net";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getStateRegistration, isAllowlisted } from "@/lib/compliance/state-registrations";
import { getActivePickupLocations } from "@/lib/compliance/pickup-locations";
import { logComplianceChange } from "@/lib/compliance/audit-log";
import type { ShippingAddress } from "@/lib/types";

export const runtime = "nodejs";

const SHIPPING_CENTS = 799;

type CheckoutRequestBody = {
  opaqueData?: { dataDescriptor: string; dataValue: string };
  shipping?: ShippingAddress;
  pickupLocationId?: string;
  buyerDob?: string;
  items?: { productId: string; quantity: number }[];
};

function isAtLeast21(dob: string): boolean {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 21);
  return birthDate <= cutoff;
}

export async function POST(req: NextRequest) {
  if (!isAuthorizeNetConfigured()) {
    return NextResponse.json(
      { error: "Payment processing isn't configured yet. Add your Authorize.Net keys to enable checkout." },
      { status: 503 }
    );
  }

  let body: CheckoutRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { opaqueData, shipping, pickupLocationId, buyerDob, items } = body;

  if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) {
    return NextResponse.json({ error: "Missing payment data." }, { status: 400 });
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Re-derive everything from the SELLABLE catalog server-side — this both
  // protects against price tampering (existing behavior) and is the
  // enforcement point for DO_NOT_SELL / WHOLESALE_ONLY: getAllProducts()
  // only ever returns FREE_SHIP / PICKUP_ONLY / RESTRICTED_DTC items, so a
  // productId for anything else simply won't be found below and the whole
  // checkout is rejected. There's no self-serve Trade login yet (see
  // COMPLIANCE.md), so WHOLESALE_ONLY is correctly unpurchasable for
  // everyone right now — that's intentional, not a bug.
  const catalog = await getAllProducts();
  const resolvedItems: {
    productId: string;
    productName: string;
    priceCents: number;
    quantity: number;
    complianceCategory: (typeof catalog)[number]["complianceCategory"];
  }[] = [];

  for (const item of items) {
    const product = catalog.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: "One of the items in your cart isn't available for online purchase." },
        { status: 400 }
      );
    }
    const quantity = Math.max(1, Math.min(20, Math.floor(item.quantity)));
    resolvedItems.push({
      productId: product.id,
      productName: product.name,
      priceCents: product.priceCents,
      quantity,
      complianceCategory: product.complianceCategory,
    });
  }

  const pickupItems = resolvedItems.filter((i) => i.complianceCategory === "PICKUP_ONLY");
  const shipItems = resolvedItems.filter((i) => i.complianceCategory !== "PICKUP_ONLY");
  const restrictedShipItems = shipItems.filter((i) => i.complianceCategory === "RESTRICTED_DTC");

  // A full address is always required — as the ship-to destination when the
  // order has shippable items, and as the card billing address either way
  // (Authorize.Net needs a real billTo for AVS even on pickup-only orders).
  if (
    !shipping?.fullName ||
    !shipping.email ||
    !shipping.line1 ||
    !shipping.city ||
    !shipping.state ||
    !shipping.zip
  ) {
    return NextResponse.json({ error: "Missing address information." }, { status: 400 });
  }

  // RESTRICTED_DTC destination-state gate. Blocks checkout with a specific
  // message rather than silently failing at fulfillment.
  if (restrictedShipItems.length > 0) {
    const registration = await getStateRegistration(shipping.state);
    if (!isAllowlisted(registration)) {
      const names = restrictedShipItems.map((i) => i.productName).join(", ");
      return NextResponse.json(
        {
          error: `${names} can't currently ship to ${shipping.state} — this business isn't yet fully registered (ATF + state tobacco tax + carrier) for that state. Remove the item or choose a different shipping address.`,
        },
        { status: 400 }
      );
    }
  }

  let pickupLocation: Awaited<ReturnType<typeof getActivePickupLocations>>[number] | undefined;
  if (pickupItems.length > 0) {
    if (!pickupLocationId) {
      return NextResponse.json({ error: "Select a pickup location for the items marked pickup-only." }, { status: 400 });
    }
    const locations = await getActivePickupLocations();
    pickupLocation = locations.find((l) => l.id === pickupLocationId);
    if (!pickupLocation) {
      return NextResponse.json({ error: "That pickup location isn't available." }, { status: 400 });
    }
  }

  // Age verification tied to the actual transaction: required whenever the
  // cart contains an age-restricted category, re-checked every checkout
  // rather than trusted from a stored account flag.
  const requiresAgeVerification = pickupItems.length > 0 || restrictedShipItems.length > 0;
  if (requiresAgeVerification) {
    if (!buyerDob || !isAtLeast21(buyerDob)) {
      return NextResponse.json(
        { error: "You must confirm a date of birth showing you're 21+ to purchase these items." },
        { status: 400 }
      );
    }
  }

  const subtotalCents = resolvedItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const shippingFeeCents = shipItems.length > 0 ? SHIPPING_CENTS : 0;
  const totalCents = subtotalCents + shippingFeeCents;

  const chargeResult = await chargeCard({
    opaqueData,
    amountCents: totalCents,
    shipping,
    items: resolvedItems,
  });

  if (!chargeResult.success) {
    return NextResponse.json({ error: chargeResult.error }, { status: 402 });
  }

  const orderId = randomUUID();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    try {
      await supabase.from("orders").insert({
        id: orderId,
        customer_name: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone,
        shipping_address: shipping,
        shipping_state: shipping.state,
        pickup_location_id: pickupLocation?.id ?? null,
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        status: "paid",
        authorize_net_transaction_id: chargeResult.transactionId,
        buyer_dob: requiresAgeVerification ? buyerDob : null,
        age_verified_at: requiresAgeVerification ? new Date().toISOString() : null,
      });

      const orderItemRows = resolvedItems.map((item) => ({
        id: randomUUID(),
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price_cents: item.priceCents,
        fulfillment_type: item.complianceCategory === "PICKUP_ONLY" ? "pickup" : "ship",
        compliance_category_snapshot: item.complianceCategory,
      }));
      await supabase.from("order_items").insert(orderItemRows);

      // Every RESTRICTED_DTC or PICKUP_ONLY line gets its own audit entry —
      // this is the data source for the monthly FL delivery-sale filing
      // export in /admin/audit-log. RESTRICTED_DTC lines always require
      // adult-signature delivery by definition (not a per-order toggle
      // anyone has to remember) — once a real specialty carrier is wired up
      // (lib/carriers/specialty-carrier.ts), its createShipment() call
      // belongs here, keyed off restrictedShipItems.
      for (const row of orderItemRows) {
        if (row.compliance_category_snapshot === "RESTRICTED_DTC" || row.compliance_category_snapshot === "PICKUP_ONLY") {
          await logComplianceChange({
            entityType: "checkout",
            entityId: row.id,
            action: `${row.compliance_category_snapshot.toLowerCase()}_checkout`,
            newValue: {
              orderId,
              productName: row.product_name,
              quantity: row.quantity,
              shippingState: shipping.state,
              pickupLocation: pickupLocation?.name ?? null,
            },
            reason: "Automatic checkout log",
          });
        }
      }
    } catch (err) {
      // The card has already been charged successfully — don't fail the
      // customer's checkout over a persistence error, just log it.
      console.error("Failed to persist order to Supabase:", err);
    }
  }

  return NextResponse.json({ orderId, transactionId: chargeResult.transactionId });
}
