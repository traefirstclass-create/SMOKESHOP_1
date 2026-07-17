import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductArt } from "@/components/ProductArt";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { formatPriceCents } from "@/lib/format";
import { iconForCategorySlug, getCategoryBySlug } from "@/lib/data/categories";
import { getAllProducts, getProductBySlug } from "@/lib/catalog";

type Params = Promise<{ slug: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);
  const allProducts = await getAllProducts();
  const related = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-foreground/50">
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {category && (
          <>
            <Link href={`/shop?category=${category.slug}`} className="hover:text-accent">
              {category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-foreground/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductArt
          seed={product.imageSeed}
          icon={iconForCategorySlug(product.categorySlug)}
          className="flex aspect-square items-center justify-center rounded-3xl"
          iconClassName="h-20 w-20 text-white/60"
        />

        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-accent">
            {formatPriceCents(product.priceCents)}
          </p>
          <p className="mt-6 leading-relaxed text-foreground/70">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <p className="mt-6 text-xs text-foreground/40">
            Must be 21+ to purchase. Valid ID required. Ships discreetly.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-xl font-bold">You might also like</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
