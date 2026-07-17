import Link from "next/link";
import { AlertTriangle, Clock, CalendarClock, Package } from "lucide-react";
import { getAllProductsAdmin } from "@/lib/compliance/products";

export const metadata = { title: "Compliance Overview | Admin" };

const STALE_DAYS = 90;
const EXPIRING_SOON_DAYS = 30;

function daysAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function AdminOverviewPage() {
  const products = await getAllProductsAdmin();

  const staleReviews = products.filter((p) => {
    const age = daysAgo(p.lastComplianceReviewDate);
    return age === null || age > STALE_DAYS;
  });

  const needsLegalReview = products.filter((p) => p.needsLegalReview);

  const expiringSoon = products.filter((p) => {
    const remaining = daysUntil(p.complianceExpiresOn);
    return remaining !== null && remaining <= EXPIRING_SOON_DAYS;
  });

  const byCategory = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.complianceCategory] = (acc[p.complianceCategory] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Compliance Overview</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {products.length} SKUs total. See{" "}
          <a href="/COMPLIANCE.md" className="underline underline-offset-2 hover:text-accent">
            COMPLIANCE.md
          </a>{" "}
          for what every rule here means.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(byCategory).map(([category, count]) => (
          <div key={category} className="rounded-xl border border-border bg-surface p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-foreground/50">
              <Package className="h-3.5 w-3.5" /> {category.replace(/_/g, " ")}
            </p>
            <p className="mt-1 text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-gold" /> Stale reviews ({staleReviews.length})
        </h2>
        <p className="mb-3 text-sm text-foreground/60">
          Never reviewed, or last reviewed more than {STALE_DAYS} days ago.
        </p>
        <FlaggedList products={staleReviews} emptyLabel="Nothing is overdue for review." />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5 text-gold" /> Flagged gray-area / needs legal review (
          {needsLegalReview.length})
        </h2>
        <FlaggedList products={needsLegalReview} emptyLabel="Nothing is flagged for legal review." />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <CalendarClock className="h-5 w-5 text-gold" /> Expiring within {EXPIRING_SOON_DAYS} days (
          {expiringSoon.length})
        </h2>
        <p className="mb-3 text-sm text-foreground/60">
          E.g. the federal hemp Total-THC standard effective November 12, 2026 — set
          compliance_expires_on for anything that rule will affect.
        </p>
        <FlaggedList products={expiringSoon} emptyLabel="Nothing is approaching its compliance expiration." />
      </section>
    </div>
  );
}

function FlaggedList({
  products,
  emptyLabel,
}: {
  products: Awaited<ReturnType<typeof getAllProductsAdmin>>;
  emptyLabel: string;
}) {
  if (products.length === 0) {
    return <p className="text-sm text-foreground/40">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {products.slice(0, 10).map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
        >
          <span className="line-clamp-1">{p.name}</span>
          <Link href="/admin/products" className="shrink-0 text-xs text-accent hover:underline">
            Review &rarr;
          </Link>
        </li>
      ))}
      {products.length > 10 && (
        <p className="text-xs text-foreground/40">and {products.length - 10} more — see Products.</p>
      )}
    </ul>
  );
}
