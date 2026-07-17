import { getAllProductsAdmin } from "@/lib/compliance/products";
import { getBannedTerms } from "@/lib/compliance/banned-terms";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const metadata = { title: "Products | Admin" };

export default async function AdminProductsPage() {
  const [products, bannedTerms] = await Promise.all([getAllProductsAdmin(), getBannedTerms()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Every SKU defaults to <span className="font-mono text-xs">DO_NOT_SELL</span> and is
          invisible to the storefront until reclassified here. Every change requires a reason and
          is written to the audit log. See{" "}
          <a href="/COMPLIANCE_STARTER_CHECKLIST.md" className="underline underline-offset-2 hover:text-accent">
            COMPLIANCE_STARTER_CHECKLIST.md
          </a>{" "}
          for suggested starting categories pending attorney sign-off.
        </p>
      </div>
      <ProductsTable products={products} bannedTerms={bannedTerms} />
    </div>
  );
}
