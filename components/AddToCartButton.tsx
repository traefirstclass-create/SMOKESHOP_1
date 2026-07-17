"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { QuantityStepper } from "@/components/QuantityStepper";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  showStepper = true,
}: {
  product: Product;
  showStepper?: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showStepper && (
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
      )}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.inStock}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" /> Added
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            {product.inStock ? "Add to cart" : "Out of stock"}
          </>
        )}
      </button>
    </div>
  );
}
