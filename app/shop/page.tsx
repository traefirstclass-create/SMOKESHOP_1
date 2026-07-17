import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts, getCategories } from "@/lib/catalog";

export const metadata = {
  title: "Shop All Products | Ali Baba Smoke Shop",
};

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, q } = await searchParams;
  const [allProducts, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  const query = (q ?? "").trim().toLowerCase();
  const products = allProducts.filter((p) => {
    const matchesCategory = !category || p.categorySlug === category;
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {activeCategory ? activeCategory.name : "Shop All Products"}
        </h1>
        {query && (
          <p className="mt-1 text-sm text-foreground/60">
            Results for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">
            Categories
          </p>
          <nav className="flex flex-wrap gap-2 lg:flex-col">
            <Link
              href="/shop"
              className={`rounded-full px-3 py-1.5 text-sm transition lg:rounded-lg ${
                !category
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-foreground/70 hover:border-accent/50"
              }`}
            >
              All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className={`rounded-full px-3 py-1.5 text-sm transition lg:rounded-lg ${
                  category === c.slug
                    ? "bg-accent text-accent-foreground"
                    : "border border-border text-foreground/70 hover:border-accent/50"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <p className="py-16 text-center text-foreground/50">
              No products found. Try a different search or category.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
