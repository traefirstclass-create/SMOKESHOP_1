"use client";

import { useState } from "react";
import { saveStateRegistrationAction } from "@/app/admin/(protected)/state-registrations/actions";
import { US_STATES } from "@/lib/data/us-states";
import type { StateRegistration } from "@/lib/types";

function StateRow({ registration }: { registration: StateRegistration }) {
  const stateName = US_STATES.find((s) => s.code === registration.state)?.name ?? registration.state;
  const [atf, setAtf] = useState(registration.atfRegistered);
  const [tax, setTax] = useState(registration.taxRegistered);
  const [carrier, setCarrier] = useState(registration.carrierReady);
  const [notes, setNotes] = useState(registration.notes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAllowlisted = atf && tax && carrier;
  const dirty =
    atf !== registration.atfRegistered ||
    tax !== registration.taxRegistered ||
    carrier !== registration.carrierReady ||
    notes !== registration.notes;

  async function handleSave() {
    setSaving(true);
    await saveStateRegistrationAction(registration.state, {
      atfRegistered: atf,
      taxRegistered: tax,
      carrierReady: carrier,
      notes,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="whitespace-nowrap px-3 py-2 text-sm">
        {stateName} <span className="text-foreground/40">({registration.state})</span>
      </td>
      <td className="px-3 py-2 text-center">
        <input type="checkbox" checked={atf} onChange={(e) => setAtf(e.target.checked)} />
      </td>
      <td className="px-3 py-2 text-center">
        <input type="checkbox" checked={tax} onChange={(e) => setTax(e.target.checked)} />
      </td>
      <td className="px-3 py-2 text-center">
        <input type="checkbox" checked={carrier} onChange={(e) => setCarrier(e.target.checked)} />
      </td>
      <td className="px-3 py-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            isAllowlisted ? "border-accent/40 text-accent" : "border-border text-foreground/40"
          }`}
        >
          {isAllowlisted ? "Allowlisted" : "Blocked"}
        </span>
      </td>
      <td className="px-3 py-2">
        <input
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
        />
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:border-accent/50 disabled:opacity-30"
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}

export function StateRegistrationsTable({ registrations }: { registrations: StateRegistration[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left">
        <thead className="bg-surface text-xs uppercase tracking-wide text-foreground/50">
          <tr>
            <th className="px-3 py-2">State</th>
            <th className="px-3 py-2 text-center">ATF</th>
            <th className="px-3 py-2 text-center">Tax</th>
            <th className="px-3 py-2 text-center">Carrier</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Notes</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <StateRow key={r.state} registration={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
