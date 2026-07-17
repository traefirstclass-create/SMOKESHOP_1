"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { markPickedUpAction } from "@/app/admin/(protected)/pickup-orders/actions";
import type { PendingPickupItem } from "@/lib/compliance/orders";

export function PickupChecklist({ item }: { item: PendingPickupItem }) {
  const [idChecked, setIdChecked] = useState(false);
  const [dobConfirmed, setDobConfirmed] = useState(false);
  const [handedOver, setHandedOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = idChecked && dobConfirmed && handedOver;

  async function handleComplete() {
    setSaving(true);
    setError(null);
    const result = await markPickedUpAction(item.orderItemId);
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
        <CheckCircle2 className="h-4 w-4" /> {item.productName} marked picked up.
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            {item.productName} &times; {item.quantity}
          </p>
          <p className="text-xs text-foreground/50">
            {item.customerName} &middot; {item.email}
            {item.buyerDob && ` · DOB on file: ${item.buyerDob}`}
          </p>
          <p className="text-xs text-foreground/40">
            {item.pickupLocationName ?? "Pickup location"} &middot; ordered{" "}
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={idChecked} onChange={(e) => setIdChecked(e.target.checked)} />
          Government ID checked in person and matches the name on this order
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={dobConfirmed} onChange={(e) => setDobConfirmed(e.target.checked)} />
          ID confirms the customer is 21+
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={handedOver} onChange={(e) => setHandedOver(e.target.checked)} />
          Items handed to the customer in person, at this location
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

      <button
        type="button"
        onClick={handleComplete}
        disabled={!allChecked || saving}
        className="mt-4 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-30"
      >
        {saving ? "Saving..." : "Mark picked up"}
      </button>
    </li>
  );
}
