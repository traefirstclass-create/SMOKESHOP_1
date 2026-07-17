import { writeFileSync } from "fs";
import { categories } from "../lib/data/categories";
import { products } from "../lib/data/products";

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const lines: string[] = [
  "-- Ali Baba Smoke Shop — placeholder catalog seed",
  "-- Generated from lib/data/categories.ts and lib/data/products.ts via `npm run generate:seed`.",
  "-- Run after schema.sql.",
  "",
  "delete from order_items;",
  "delete from orders;",
  "delete from products;",
  "delete from categories;",
  "",
];

for (const c of categories) {
  lines.push(
    `insert into categories (id, name, slug, description, icon) values (gen_random_uuid(), ${sqlString(
      c.name
    )}, ${sqlString(c.slug)}, ${sqlString(c.description)}, ${sqlString(c.icon)});`
  );
}

lines.push("");

for (const p of products) {
  lines.push(
    `insert into products (id, name, slug, description, price_cents, category_slug, brand, image_seed, in_stock, featured) values (${sqlString(
      p.id
    )}, ${sqlString(p.name)}, ${sqlString(p.slug)}, ${sqlString(p.description)}, ${
      p.priceCents
    }, ${sqlString(p.categorySlug)}, ${sqlString(p.brand)}, ${sqlString(p.imageSeed)}, ${
      p.inStock
    }, ${p.featured});`
  );
}

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log(`Wrote ${products.length} products and ${categories.length} categories to supabase/seed.sql`);
