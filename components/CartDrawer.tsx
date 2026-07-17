"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { QuantityStepper } from "@/components/QuantityStepper";
import { ProductArt } from "@/components/ProductArt";
import { formatPriceCents } from "@/lib/format";
import { iconForCategorySlug } from "@/lib/data/categories";

export function CartDrawer() {
  const { items, itemCount, subtotalCents, isDrawerOpen, closeDrawer, setQuantity, removeItem } =
    useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold">
                Your Cart {itemCount > 0 && <span className="text-foreground/50">({itemCount})</span>}
              </h2>
              <button aria-label="Close cart" onClick={closeDrawer}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-foreground/50">
                  Your cart is empty.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex gap-3">
                      <ProductArt
                        seed={product.imageSeed}
                        icon={iconForCategorySlug(product.categorySlug)}
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                        iconClassName="h-6 w-6 text-white/60"
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-sm font-medium leading-snug">{product.name}</p>
                        <p className="text-sm text-accent">
                          {formatPriceCents(product.priceCents)}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <QuantityStepper
                            quantity={quantity}
                            onChange={(q) => setQuantity(product.id, q)}
                          />
                          <button
                            aria-label={`Remove ${product.name}`}
                            onClick={() => removeItem(product.id)}
                            className="text-foreground/40 transition hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-semibold">{formatPriceCents(subtotalCents)}</span>
                </div>
                <p className="mb-3 text-xs text-foreground/40">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block w-full rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="mt-2 block w-full rounded-full border border-border px-6 py-2.5 text-center text-sm font-medium transition hover:border-accent/50"
                >
                  View cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
