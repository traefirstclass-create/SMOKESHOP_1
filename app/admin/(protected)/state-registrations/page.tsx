import { getAllStateRegistrations } from "@/lib/compliance/state-registrations";
import { StateRegistrationsTable } from "@/components/admin/StateRegistrationsTable";

export const metadata = { title: "State Registrations | Admin" };

export default async function StateRegistrationsPage() {
  const registrations = await getAllStateRegistrations();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">State Registrations</h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground/60">
          A state only allows RESTRICTED_DTC checkout when all three boxes are checked. Leave a
          state fully unchecked until this business is actually registered there — checkout blocks
          automatically for any state not fully registered.
        </p>
      </div>
      <StateRegistrationsTable registrations={registrations} />
    </div>
  );
}
