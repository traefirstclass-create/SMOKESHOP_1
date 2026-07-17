import { getSupabaseClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";
import {
  categories as staticCategories,
  getCategoryBySlug as staticGetCategoryBySlug,
} from "@/lib/data/categories";
import {
  products as staticProducts,
  getFeaturedProducts as staticGetFeaturedProducts,
  getProductsByCategory as staticGetProductsByCategory,
  getProductBySlug as staticGetProductBySlug,
  searchProducts as staticSearchProducts,
} from "@/lib/data/products";

// Reads Supabase when it's configured (see supabase/schema.sql + seed.sql),
// otherwise falls back to the static placeholder catalog in lib/data/ so the
// site is fully browsable before a database is wired up.

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
};

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
  };
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

export async function getAllProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return staticProducts;

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price_cents, category_slug, brand, image_seed, in_stock, featured"
    )
    .order("name");

  if (error || !data || data.length === 0) return staticProducts;
  return (data as ProductRow[]).map(mapProductRow);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return staticGetFeaturedProducts();

  const all = await getAllProducts();
  const featured = all.filter((p) => p.featured);
  return featured.length > 0 ? featured : staticGetFeaturedProducts();
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return staticGetProductsByCategory(categorySlug);

  const all = await getAllProducts();
  return all.filter((p) => p.categorySlug === categorySlug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) return staticGetProductBySlug(slug);

  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) ?? staticGetProductBySlug(slug);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const all = await getAllProducts();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  const results = all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
  return results.length > 0 || all !== staticProducts ? results : staticSearchProducts(query);
}
