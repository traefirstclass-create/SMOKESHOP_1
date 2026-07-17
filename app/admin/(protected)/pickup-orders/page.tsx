import { getPendingPickupItems } from "@/lib/compliance/orders";
import { PickupChecklist } from "@/components/admin/PickupChecklist";

export const metadata = { title: "Pickup Orders | Admin" };

export default async function PickupOrdersPage() {
  const items = await getPendingPickupItems();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Pickup Orders</h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground/60">
          PICKUP_ONLY items can never ship — this is the specific in-person, at-handoff ID check
          mechanism that keeps these sales outside Florida&apos;s remote/delivery-sale statute (FL
          210.095). Distinct from a generic buy-online-pickup-in-store flow.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-foreground/40">No pending pickup orders.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <PickupChecklist key={item.orderItemId} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
