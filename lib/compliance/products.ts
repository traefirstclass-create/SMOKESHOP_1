import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { logComplianceChange } from "@/lib/compliance/audit-log";
import type { ComplianceCategory, Product } from "@/lib/types";

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
  compliance_category: ComplianceCategory;
  needs_legal_review: boolean;
  last_compliance_review_date: string | null;
  reviewed_by: string | null;
  compliance_expires_on: string | null;
  compliance_notes: string;
};

// Single string literal (not built via concatenation) so Supabase's client
// can statically infer the row type from it — string concatenation widens
// to `string` and breaks that inference.
const COLUMNS =
  "id, name, slug, description, price_cents, category_slug, brand, image_seed, in_stock, featured, compliance_category, needs_legal_review, last_compliance_review_date, reviewed_by, compliance_expires_on, compliance_notes";

function mapRow(row: ProductRow): Product {
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

// Unfiltered — includes DO_NOT_SELL and WHOLESALE_ONLY. Admin-only; never
// expose this to a public-facing page.
export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("products").select(COLUMNS).order("name");
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapRow);
}

export type ComplianceReviewUpdate = {
  complianceCategory: ComplianceCategory;
  needsLegalReview: boolean;
  complianceExpiresOn: string | null;
  complianceNotes: string;
};

// Reclassifies a SKU — the one path by which a product can ever leave
// DO_NOT_SELL. Always stamps last_compliance_review_date/reviewed_by to the
// acting staff member and logs the before/after to compliance_audit_log.
export async function updateProductCompliance(
  productId: string,
  update: ComplianceReviewUpdate,
  staffUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { success: false, error: "Supabase isn't configured." };

  const { data: existing } = await supabase.from("products").select(COLUMNS).eq("id", productId).maybeSingle();
  if (!existing) return { success: false, error: "Product not found." };

  const previous = mapRow(existing as ProductRow);
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("products")
    .update({
      compliance_category: update.complianceCategory,
      needs_legal_review: update.needsLegalReview,
      compliance_expires_on: update.complianceExpiresOn,
      compliance_notes: update.complianceNotes,
      last_compliance_review_date: today,
      reviewed_by: staffUserId,
    })
    .eq("id", productId);

  if (error) return { success: false, error: error.message };

  await logComplianceChange({
    entityType: "product",
    entityId: productId,
    action: "category_changed",
    previousValue: {
      complianceCategory: previous.complianceCategory,
      needsLegalReview: previous.needsLegalReview,
      complianceExpiresOn: previous.complianceExpiresOn,
      complianceNotes: previous.complianceNotes,
    },
    newValue: update,
    reason,
    performedBy: staffUserId,
  });

  return { success: true };
}
