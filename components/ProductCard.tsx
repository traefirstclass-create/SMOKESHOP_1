import Link from "next/link";
import { ProductArt } from "@/components/ProductArt";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPriceCents } from "@/lib/format";
import { iconForCategorySlug } from "@/lib/data/categories";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/40">
      <Link href={`/product/${product.slug}`} className="block">
        <ProductArt
          seed={product.imageSeed}
          icon={iconForCategorySlug(product.categorySlug)}
          className="flex aspect-square items-center justify-center transition duration-300 group-hover:scale-[1.02]"
          iconClassName="h-12 w-12 text-white/60"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-foreground/50">
          {product.brand}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 font-medium leading-snug transition group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="mt-auto pt-2 text-lg font-semibold text-accent">
          {formatPriceCents(product.priceCents)}
        </p>
        <AddToCartButton product={product} showStepper={false} />
      </div>
    </div>
  );
}
