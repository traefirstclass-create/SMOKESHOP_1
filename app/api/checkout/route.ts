import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAllProducts } from "@/lib/catalog";
import { chargeCard, isAuthorizeNetConfigured } from "@/lib/authorize-net";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { ShippingAddress } from "@/lib/types";

export const runtime = "nodejs";

const SHIPPING_CENTS = 799;

type CheckoutRequestBody = {
  opaqueData?: { dataDescriptor: string; dataValue: string };
  shipping?: ShippingAddress;
  items?: { productId: string; quantity: number }[];
};

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

  const { opaqueData, shipping, items } = body;

  if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) {
    return NextResponse.json({ error: "Missing payment data." }, { status: 400 });
  }
  if (
    !shipping?.fullName ||
    !shipping.email ||
    !shipping.line1 ||
    !shipping.city ||
    !shipping.state ||
    !shipping.zip
  ) {
    return NextResponse.json({ error: "Missing shipping information." }, { status: 400 });
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Re-derive prices from the catalog server-side rather than trusting the
  // client, so a tampered request can't check out at an arbitrary amount.
  const catalog = await getAllProducts();
  const resolvedItems: {
    productId: string;
    productName: string;
    priceCents: number;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const product = catalog.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: "One of the items in your cart is no longer available." },
        { status: 400 }
      );
    }
    const quantity = Math.max(1, Math.min(20, Math.floor(item.quantity)));
    resolvedItems.push({
      productId: product.id,
      productName: product.name,
      priceCents: product.priceCents,
      quantity,
    });
  }

  const subtotalCents = resolvedItems.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );
  const totalCents = subtotalCents + SHIPPING_CENTS;

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
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        status: "paid",
        authorize_net_transaction_id: chargeResult.transactionId,
      });

      await supabase.from("order_items").insert(
        resolvedItems.map((item) => ({
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price_cents: item.priceCents,
        }))
      );
    } catch (err) {
      // The card has already been charged successfully — don't fail the
      // customer's checkout over a persistence error, just log it.
      console.error("Failed to persist order to Supabase:", err);
    }
  }

  return NextResponse.json({ orderId, transactionId: chargeResult.transactionId });
}
