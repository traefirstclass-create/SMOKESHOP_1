"use client";

import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/CartDrawer";
import { AgeGate } from "@/components/AgeGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AgeGate />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
