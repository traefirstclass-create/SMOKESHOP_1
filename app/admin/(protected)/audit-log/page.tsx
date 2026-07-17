import { Download } from "lucide-react";
import { getAuditLog } from "@/lib/compliance/audit-log";
import type { ComplianceAuditLogEntry } from "@/lib/types";

export const metadata = { title: "Audit Log | Admin" };

const ENTITY_TYPES: ComplianceAuditLogEntry["entityType"][] = [
  "product",
  "checkout",
  "state_registration",
  "trade_application",
];

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

type SearchParams = Promise<{ entityType?: string }>;

export default async function AuditLogPage({ searchParams }: { searchParams: SearchParams }) {
  const { entityType } = await searchParams;
  const entries = await getAuditLog({
    entityType: entityType as ComplianceAuditLogEntry["entityType"] | undefined,
  });
  const month = currentMonth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground/60">
          Every compliance-relevant action: SKU category changes, RESTRICTED_DTC/PICKUP_ONLY
          checkouts, state-registration edits, and Trade application decisions.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex items-center gap-2">
          <select name="entityType" defaultValue={entityType ?? ""} className="input w-auto">
            <option value="">All types</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-accent/50">
            Filter
          </button>
        </form>

        <a
          href={`/api/admin/audit-log/export?month=${month}`}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:bg-accent-hover"
        >
          <Download className="h-3.5 w-3.5" /> Export {month} CSV (checkout entries)
        </a>
      </div>
      <p className="-mt-3 text-xs text-foreground/40">
        Starting point for Florida&apos;s monthly tobacco delivery-sale filing — confirm the field
        mapping with your accountant/attorney before relying on it for a real filing.
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-foreground/50">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 align-top">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-foreground/60">
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-xs">{e.entityType}</td>
                <td className="px-3 py-2 text-xs">{e.action}</td>
                <td className="max-w-[16rem] truncate px-3 py-2 font-mono text-xs">{e.entityId}</td>
                <td className="max-w-xs px-3 py-2 text-xs text-foreground/70">{e.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="p-4 text-sm text-foreground/40">No entries yet.</p>}
      </div>
    </div>
  );
}
