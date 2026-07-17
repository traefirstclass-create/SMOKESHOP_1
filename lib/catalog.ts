import { getSupabaseClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";
import { SELLABLE_STOREFRONT_CATEGORIES } from "@/lib/types";
import {
  categories as staticCategories,
  getCategoryBySlug as staticGetCategoryBySlug,
} from "@/lib/data/categories";
import { products as staticProducts } from "@/lib/data/products";

// Reads Supabase when it's configured (see supabase/schema.sql + seed.sql),
// otherwise falls back to the static placeholder catalog in lib/data/ so the
// site is fully browsable before a database is wired up.
//
// Every read here is filtered to SELLABLE_STOREFRONT_CATEGORIES —
// DO_NOT_SELL and WHOLESALE_ONLY products are never returned to the public
// storefront, full stop, not just hidden behind a disabled button. This is
// belt-and-suspenders with the RLS policy in supabase/schema.sql, which
// enforces the same rule at the database layer for direct queries too.

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  category_slug: string;
  brand: string;
  image_seed: string;
  in_stock: boolean;
  featured: boolean;
  compliance_category: Product["complianceCategory"];
  needs_legal_review: boolean;
  last_compliance_review_date: string | null;
  reviewed_by: string | null;
  compliance_expires_on: string | null;
  compliance_notes: string;
};

// Single string literal (not built via concatenation) so Supabase's client
// can statically infer the row type from it — string concatenation widens
// to `string` and breaks that inference.
const PRODUCT_COLUMNS =
  "id, name, slug, description, price_cents, category_slug, brand, image_seed, in_stock, featured, compliance_category, needs_legal_review, last_compliance_review_date, reviewed_by, compliance_expires_on, compliance_notes";

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.price_cents,
    categorySlug: row.category_slug,
    brand: row.brand,
    imageSeed: row.image_seed,
    inStock: row.in_stock,
    featured: row.featured,
    complianceCategory: row.compliance_category,
    needsLegalReview: row.needs_legal_review,
    lastComplianceReviewDate: row.last_compliance_review_date,
    reviewedBy: row.reviewed_by,
    complianceExpiresOn: row.compliance_expires_on,
    complianceNotes: row.compliance_notes,
  };
}

function isSellable(p: Product): boolean {
  return (SELLABLE_STOREFRONT_CATEGORIES as string[]).includes(p.complianceCategory);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return staticCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon")
    .order("name");

  if (error || !data || data.length === 0) return staticCategories;
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? staticGetCategoryBySlug(slug);
}

// Single source of truth per request: Supabase when configured, static
// fallback otherwise — never blended, since blending live DB data with
// placeholder fallback data could leak an unreviewed static product past the
// compliance filter for an individual lookup. Always filtered to
// SELLABLE_STOREFRONT_CATEGORIES.
async function fetchSellableProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return staticProducts.filter(isSellable);

  const { data, error } = await supabase.from("products").select(PRODUCT_COLUMNS).order("name");

  if (error || !data) return staticProducts.filter(isSellable);
  return (data as ProductRow[]).map(mapProductRow).filter(isSellable);
}

export async function getAllProducts(): Promise<Product[]> {
  return fetchSellableProducts();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await fetchSellableProducts();
  return all.filter((p) => p.featured);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const all = await fetchSellableProducts();
  return all.filter((p) => p.categorySlug === categorySlug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await fetchSellableProducts();
  return all.find((p) => p.slug === slug);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const all = await fetchSellableProducts();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}
