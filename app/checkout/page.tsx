"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Lock, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPriceCents } from "@/lib/format";
import type { ShippingAddress } from "@/lib/types";

const AUTHORIZE_NET_ENV =
  process.env.NEXT_PUBLIC_AUTHORIZE_NET_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";

const ACCEPT_JS_SRC =
  AUTHORIZE_NET_ENV === "production"
    ? "https://js.authorize.net/v1/Accept.js"
    : "https://jstest.authorize.net/v1/Accept.js";

const CLIENT_KEY = process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY ?? "";
const API_LOGIN_ID = process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID ?? "";
const PAYMENT_CONFIGURED = Boolean(CLIENT_KEY && API_LOGIN_ID);

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart } = useCart();
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  });
  const [card, setCard] = useState({
    number: "",
    month: "",
    year: "",
    code: "",
  });

  const shippingCents = items.length > 0 ? 799 : 0;
  const totalCents = subtotalCents + shippingCents;

  function updateShipping<K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!PAYMENT_CONFIGURED) {
      setError(
        "Payment processing isn't configured yet. Add your Authorize.Net keys to enable checkout."
      );
      return;
    }
    if (!scriptReady || !window.Accept) {
      setError("Payment form is still loading. Please try again in a moment.");
      return;
    }

    setSubmitting(true);

    window.Accept.dispatchData(
      {
        authData: {
          clientKey: CLIENT_KEY,
          apiLoginID: API_LOGIN_ID,
        },
        cardData: {
          cardNumber: card.number.replace(/\s+/g, ""),
          month: card.month,
          year: card.year,
          cardCode: card.code,
        },
      },
      async (response) => {
        if (response.messages.resultCode !== "Ok" || !response.opaqueData) {
          setError(
            response.messages.message[0]?.text ??
              "There was a problem processing your card."
          );
          setSubmitting(false);
          return;
        }

        try {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              opaqueData: response.opaqueData,
              shipping,
              items: items.map(({ product, quantity }) => ({
                productId: product.id,
                productName: product.name,
                priceCents: product.priceCents,
                quantity,
              })),
              subtotalCents,
              shippingCents,
              totalCents,
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            setError(data.error ?? "Payment was declined. Please try another card.");
            setSubmitting(false);
            return;
          }

          clearCart();
          router.push(`/order-confirmation/${data.orderId}`);
        } catch {
          setError("Something went wrong submitting your order. Please try again.");
          setSubmitting(false);
        }
      }
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-foreground/60">
          Add something to your cart before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
        >
          Browse products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Script
        src={ACCEPT_JS_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Shipping Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Full name"
                autoComplete="name"
                className="input"
                value={shipping.fullName}
                onChange={(e) => updateShipping("fullName", e.target.value)}
              />
              <input
                required
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="input"
                value={shipping.email}
                onChange={(e) => updateShipping("email", e.target.value)}
              />
              <input
                required
                type="tel"
                placeholder="Phone"
                autoComplete="tel"
                className="input"
                value={shipping.phone}
                onChange={(e) => updateShipping("phone", e.target.value)}
              />
              <input
                required
                placeholder="Address line 1"
                autoComplete="address-line1"
                className="input sm:col-span-2"
                value={shipping.line1}
                onChange={(e) => updateShipping("line1", e.target.value)}
              />
              <input
                placeholder="Address line 2 (optional)"
                autoComplete="address-line2"
                className="input sm:col-span-2"
                value={shipping.line2}
                onChange={(e) => updateShipping("line2", e.target.value)}
              />
              <input
                required
                placeholder="City"
                autoComplete="address-level2"
                className="input"
                value={shipping.city}
                onChange={(e) => updateShipping("city", e.target.value)}
              />
              <select
                required
                className="input"
                value={shipping.state}
                onChange={(e) => updateShipping("state", e.target.value)}
              >
                <option value="">State</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="ZIP code"
                autoComplete="postal-code"
                className="input"
                value={shipping.zip}
                onChange={(e) => updateShipping("zip", e.target.value)}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-lg font-semibold">Payment</h2>
            <p className="mb-4 flex items-center gap-1.5 text-xs text-foreground/50">
              <Lock className="h-3.5 w-3.5" /> Card details are sent directly
              to Authorize.Net and never touch our server.
            </p>
            {!PAYMENT_CONFIGURED && (
              <p className="mb-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                Payment processing isn&apos;t configured yet. Set the
                Authorize.Net environment variables to enable live checkout.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Card number"
                autoComplete="cc-number"
                inputMode="numeric"
                className="input sm:col-span-2"
                value={card.number}
                onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
              />
              <input
                required
                placeholder="MM"
                autoComplete="cc-exp-month"
                inputMode="numeric"
                maxLength={2}
                className="input"
                value={card.month}
                onChange={(e) => setCard((c) => ({ ...c, month: e.target.value }))}
              />
              <input
                required
                placeholder="YYYY"
                autoComplete="cc-exp-year"
                inputMode="numeric"
                maxLength={4}
                className="input"
                value={card.year}
                onChange={(e) => setCard((c) => ({ ...c, year: e.target.value }))}
              />
              <input
                required
                placeholder="CVV"
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
                className="input sm:col-span-2"
                value={card.code}
                onChange={(e) => setCard((c) => ({ ...c, code: e.target.value }))}
              />
            </div>
          </section>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <ul className="mb-4 flex flex-col gap-2 text-sm text-foreground/70">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-2">
                <span className="line-clamp-1">
                  {product.name} &times; {quantity}
                </span>
                <span className="shrink-0">
                  {formatPriceCents(product.priceCents * quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-foreground/70">
              <span>Subtotal</span>
              <span>{formatPriceCents(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>Shipping</span>
              <span>{formatPriceCents(shippingCents)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-accent">{formatPriceCents(totalCents)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
