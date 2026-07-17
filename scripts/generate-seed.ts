import { writeFileSync } from "fs";
import { categories } from "../lib/data/categories";
import { products } from "../lib/data/products";
import { STARTER_BANNED_TERMS } from "../lib/compliance/content-lint";

// Duplicated from lib/compliance/settings.ts rather than imported, since
// that module is guarded with "server-only" (throws when loaded outside a
// Next.js server context, which this plain tsx script is not).
const WARNING_RESTRICTED_DTC_KEY = "warning_restricted_dtc";
const WARNING_PICKUP_ONLY_KEY = "warning_pickup_only";

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

// Fixed UUID (not gen_random_uuid()) so re-running this seed is safe — the
// single Tampa pickup location gets upserted in place rather than
// duplicated. Edit its address/details directly in Supabase once real store
// info is available (see COMPLIANCE.md).
const TAMPA_PICKUP_LOCATION_ID = "00000000-0000-4000-8000-000000000001";

const PLACEHOLDER_WARNING =
  "[INSERT ATTORNEY-APPROVED WARNING LANGUAGE HERE before this product goes live for real sale. This placeholder is intentional — do not treat it as compliant copy.]";

const lines: string[] = [
  "-- Ali Baba Smoke Shop — placeholder catalog + compliance reference data seed",
  "-- Generated from lib/data/*.ts and lib/compliance/*.ts via `npm run generate:seed`.",
  "-- Run after schema.sql. Safe to re-run: catalog rows are fully replaced,",
  "-- but reference/config data (pickup location, warning-label text, banned",
  "-- terms) only inserts what's missing so admin edits are never clobbered.",
  "-- Operational data (orders, state_registrations, staff_profiles,",
  "-- trade_applications, compliance_audit_log) is never touched here.",
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
    `insert into products (id, name, slug, description, price_cents, category_slug, brand, image_seed, in_stock, featured, compliance_category, needs_legal_review) values (${sqlString(
      p.id
    )}, ${sqlString(p.name)}, ${sqlString(p.slug)}, ${sqlString(p.description)}, ${
      p.priceCents
    }, ${sqlString(p.categorySlug)}, ${sqlString(p.brand)}, ${sqlString(p.imageSeed)}, ${
      p.inStock
    }, ${p.featured}, 'DO_NOT_SELL', true);`
  );
}

lines.push(
  "",
  "-- Compliance reference data",
  `insert into pickup_locations (id, name, address_line1, city, state, zip, is_active) values (${sqlString(
    TAMPA_PICKUP_LOCATION_ID
  )}, ${sqlString("Ali Baba Smoke Shop - Tampa")}, ${sqlString("123 Placeholder Ave")}, ${sqlString(
    "Tampa"
  )}, ${sqlString("FL")}, ${sqlString("33602")}, true) on conflict (id) do nothing;`,
  "",
  `insert into compliance_settings (key, value) values (${sqlString(WARNING_RESTRICTED_DTC_KEY)}, ${sqlString(
    PLACEHOLDER_WARNING
  )}) on conflict (key) do nothing;`,
  `insert into compliance_settings (key, value) values (${sqlString(WARNING_PICKUP_ONLY_KEY)}, ${sqlString(
    PLACEHOLDER_WARNING
  )}) on conflict (key) do nothing;`,
  ""
);

for (const term of STARTER_BANNED_TERMS) {
  lines.push(
    `insert into content_banned_terms (id, phrase, category, severity, notes) values (gen_random_uuid(), ${sqlString(
      term.phrase
    )}, ${sqlString(term.category)}, ${sqlString(term.severity)}, ${sqlString(
      term.notes
    )}) on conflict (phrase) do nothing;`
  );
}

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log(
  `Wrote ${products.length} products, ${categories.length} categories, 1 pickup location, 2 compliance settings, and ${STARTER_BANNED_TERMS.length} banned terms to supabase/seed.sql`
);
