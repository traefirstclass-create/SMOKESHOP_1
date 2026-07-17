import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { formatPriceCents } from "@/lib/format";

type Params = Promise<{ id: string }>;

type OrderRow = {
  id: string;
  customer_name: string;
  email: string;
  subtotal_cents: number;
  total_cents: number;
  status: string;
  created_at: string;
};

type OrderItemRow = {
  product_name: string;
  quantity: number;
  price_cents: number;
};

export default async function OrderConfirmationPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = getSupabaseAdminClient();
  let order: OrderRow | null = null;
  let orderItems: OrderItemRow[] = [];

  if (supabase) {
    const { data: orderData } = await supabase
      .from("orders")
      .select("id, customer_name, email, subtotal_cents, total_cents, status, created_at")
      .eq("id", id)
      .maybeSingle();

    if (orderData) {
      order = orderData as OrderRow;
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("product_name, quantity, price_cents")
        .eq("order_id", id);
      orderItems = (itemsData as OrderItemRow[]) ?? [];
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-16 w-16 text-leaf" />
      <h1 className="mt-6 text-3xl font-bold">Thank you for your order!</h1>
      <p className="mt-2 text-foreground/60">
        Order confirmation:{" "}
        <span className="font-mono text-foreground">{id}</span>
      </p>

      {order ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-left">
          <p className="text-sm text-foreground/60">
            A confirmation has been recorded for {order.email}.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {orderItems.map((item, i) => (
              <li key={i} className="flex justify-between text-foreground/70">
                <span>
                  {item.product_name} &times; {item.quantity}
                </span>
                <span>{formatPriceCents(item.price_cents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="text-accent">{formatPriceCents(order.total_cents)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-foreground/50">
          Your payment was processed. Order details will be emailed to you
          shortly.
        </p>
      )}

      <Link
        href="/shop"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
      >
        Continue Shopping <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
