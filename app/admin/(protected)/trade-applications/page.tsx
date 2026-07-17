import { getTradeApplications } from "@/lib/compliance/trade-applications";
import { TradeApplicationsList } from "@/components/admin/TradeApplicationsList";

export const metadata = { title: "Trade Applications | Admin" };

export default async function TradeApplicationsPage() {
  const applications = await getTradeApplications();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Trade Applications</h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground/60">
          There&apos;s no self-serve wholesale storefront yet (see COMPLIANCE.md) — approving an
          application here is a record-keeping step. Follow up with the business directly to
          arrange wholesale orders until that program is built out.
        </p>
      </div>
      <TradeApplicationsList applications={applications} />
    </div>
  );
}
