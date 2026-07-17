"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { saveProductComplianceAction } from "@/app/admin/(protected)/products/actions";
import { lintContent } from "@/lib/compliance/content-lint";
import { COMPLIANCE_CATEGORIES } from "@/lib/types";
import type { BannedTerm, Product } from "@/lib/types";

const CATEGORY_STYLES: Record<string, string> = {
  DO_NOT_SELL: "border-red-500/40 text-red-300",
  FREE_SHIP: "border-accent/40 text-accent",
  PICKUP_ONLY: "border-gold/40 text-gold",
  RESTRICTED_DTC: "border-gold/40 text-gold",
  WHOLESALE_ONLY: "border-foreground/30 text-foreground/60",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        CATEGORY_STYLES[category] ?? "border-border text-foreground/60"
      }`}
    >
      {category.replace(/_/g, " ")}
    </span>
  );
}

function ProductRow({ product, bannedTerms }: { product: Product; bannedTerms: BannedTerm[] }) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState(product.complianceCategory);
  const [needsLegalReview, setNeedsLegalReview] = useState(product.needsLegalReview);
  const [expiresOn, setExpiresOn] = useState(product.complianceExpiresOn ?? "");
  const [notes, setNotes] = useState(product.complianceNotes);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const lintFlags = lintContent(`${product.name} ${product.description} ${notes}`, bannedTerms);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await saveProductComplianceAction(
      product.id,
      {
        complianceCategory: category,
        needsLegalReview,
        complianceExpiresOn: expiresOn || null,
        complianceNotes: notes,
      },
      reason
    );
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong saving this product.");
      return;
    }
    setSaved(true);
    setReason("");
  }

  return (
    <li className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="truncate text-xs text-foreground/40">{product.brand}</p>
        </div>
        <CategoryBadge category={product.complianceCategory} />
        {product.needsLegalReview && <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />}
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-foreground/60">
              Compliance category
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value as Product["complianceCategory"])}
              >
                {COMPLIANCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-foreground/60">
              Compliance expires on (optional)
              <input
                type="date"
                className="input"
                value={expiresOn}
                onChange={(e) => setExpiresOn(e.target.value)}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={needsLegalReview}
              onChange={(e) => setNeedsLegalReview(e.target.checked)}
            />
            Flag as gray-area / needs legal review
          </label>

          <label className="flex flex-col gap-1 text-xs text-foreground/60">
            Notes
            <textarea
              className="input min-h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this category, what's still pending, citations, etc."
            />
          </label>

          {lintFlags.length > 0 && (
            <div className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
              <p className="mb-1 font-semibold">Content check flagged:</p>
              <ul className="flex flex-col gap-0.5">
                {lintFlags.map((f, i) => (
                  <li key={i}>
                    &ldquo;{f.phrase}&rdquo; ({f.category.replace(/_/g, " ")}, {f.severity})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="flex flex-col gap-1 text-xs text-foreground/60">
            Reason for this change (required, goes to the audit log)
            <input
              className="input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attorney confirmed FREE_SHIP for hardware-only SKUs on 2026-07-20"
            />
          </label>

          {error && <p className="text-xs text-red-300">{error}</p>}
          {saved && <p className="text-xs text-accent">Saved.</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="self-start rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </li>
  );
}

export function ProductsTable({ products, bannedTerms }: { products: Product[]; bannedTerms: BannedTerm[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {products.map((p) => (
        <ProductRow key={p.id} product={p} bannedTerms={bannedTerms} />
      ))}
    </ul>
  );
}
