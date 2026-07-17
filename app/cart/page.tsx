"use client";

import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { QuantityStepper } from "@/components/QuantityStepper";
import { ProductArt } from "@/components/ProductArt";
import { formatPriceCents } from "@/lib/format";
import { iconForCategorySlug } from "@/lib/data/categories";

export default function CartPage() {
  const { items, subtotalCents, setQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-foreground/60">
          Looks like you haven&apos;t added anything yet.
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
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <ul className="flex flex-col gap-5 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <ProductArt
                seed={product.imageSeed}
                icon={iconForCategorySlug(product.categorySlug)}
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl"
                iconClassName="h-8 w-8 text-white/60"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50">
                    {product.brand}
                  </p>
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-medium hover:text-accent"
                  >
                    {product.name}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    quantity={quantity}
                    onChange={(q) => setQuantity(product.id, q)}
                  />
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-accent">
                      {formatPriceCents(product.priceCents * quantity)}
                    </span>
                    <button
                      aria-label={`Remove ${product.name}`}
                      onClick={() => removeItem(product.id)}
                      className="text-foreground/40 transition hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="flex items-center justify-between text-sm text-foreground/70">
            <span>Subtotal</span>
            <span>{formatPriceCents(subtotalCents)}</span>
          </div>
          <p className="mt-2 text-xs text-foreground/40">
            Shipping and taxes calculated at checkout.
          </p>
          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
