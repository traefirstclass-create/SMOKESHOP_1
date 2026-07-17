import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/supabase/server-auth";
import { getAuditLog } from "@/lib/compliance/audit-log";

export const runtime = "nodejs";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

// Exports RESTRICTED_DTC/PICKUP_ONLY checkout log entries for one calendar
// month as a starting point for Florida's monthly tobacco delivery-sale
// filing (due by the 10th). This is NOT guaranteed to match the Florida DOR's
// exact required form/fields — have the business's accountant/attorney
// confirm the field mapping before relying on it for a real filing.
export async function GET(req: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month"); // "YYYY-MM"
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Provide ?month=YYYY-MM" }, { status: 400 });
  }

  const from = `${month}-01T00:00:00.000Z`;
  const [year, monthNum] = month.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNum, 1));
  const to = nextMonth.toISOString();

  const entries = await getAuditLog({ entityType: "checkout", from, to });

  const header = ["date", "action", "order_item_id", "product_name", "quantity", "shipping_state", "pickup_location"];
  const rows = entries.map((e) => {
    const v = (e.newValue ?? {}) as Record<string, unknown>;
    return [
      e.createdAt,
      e.action,
      e.entityId,
      v.productName ?? "",
      v.quantity ?? "",
      v.shippingState ?? "",
      v.pickupLocation ?? "",
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tobacco-delivery-sales-${month}.csv"`,
    },
  });
}
