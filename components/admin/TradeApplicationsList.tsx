"use client";

import { useState } from "react";
import { reviewTradeApplicationAction } from "@/app/admin/(protected)/trade-applications/actions";
import type { TradeApplication } from "@/lib/types";

const STATUS_STYLES: Record<TradeApplication["status"], string> = {
  pending: "border-gold/40 text-gold",
  approved: "border-accent/40 text-accent",
  rejected: "border-red-500/40 text-red-300",
};

function ApplicationCard({ application }: { application: TradeApplication }) {
  const [status, setStatus] = useState(application.status);
  const [saving, setSaving] = useState<"approved" | "rejected" | null>(null);

  async function handleReview(next: "approved" | "rejected") {
    setSaving(next);
    const result = await reviewTradeApplicationAction(application.id, next);
    setSaving(null);
    if (result.success) setStatus(next);
  }

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{application.businessName}</p>
          <p className="text-sm text-foreground/60">
            {application.contactName} &middot; {application.email} &middot; {application.phone}
          </p>
          <p className="mt-1 text-xs text-foreground/40">
            Resale cert: {application.resaleCertNumber || "—"} &middot; License:{" "}
            {application.businessLicenseNumber || "—"}
          </p>
          {application.notes && <p className="mt-2 text-sm text-foreground/70">{application.notes}</p>}
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      </div>

      {status === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => handleReview("approved")}
            disabled={saving !== null}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-50"
          >
            {saving === "approved" ? "Saving..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => handleReview("rejected")}
            disabled={saving !== null}
            className="rounded-full border border-border px-4 py-1.5 text-xs font-medium transition hover:border-red-500/50 hover:text-red-300 disabled:opacity-50"
          >
            {saving === "rejected" ? "Saving..." : "Reject"}
          </button>
        </div>
      )}
    </li>
  );
}

export function TradeApplicationsList({ applications }: { applications: TradeApplication[] }) {
  if (applications.length === 0) {
    return <p className="text-sm text-foreground/40">No Trade applications yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {applications.map((a) => (
        <ApplicationCard key={a.id} application={a} />
      ))}
    </ul>
  );
}
