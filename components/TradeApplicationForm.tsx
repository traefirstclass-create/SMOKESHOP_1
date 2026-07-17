"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitTradeApplicationAction } from "@/app/trade/apply/actions";

export function TradeApplicationForm() {
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    resaleCertNumber: "",
    businessLicenseNumber: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await submitTradeApplicationAction(form);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong submitting this application.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-5 py-4 text-accent">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm">Thanks — we&apos;ve received your application and will follow up soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input
        required
        placeholder="Business name"
        className="input sm:col-span-2"
        value={form.businessName}
        onChange={(e) => update("businessName", e.target.value)}
      />
      <input
        required
        placeholder="Contact name"
        className="input"
        value={form.contactName}
        onChange={(e) => update("contactName", e.target.value)}
      />
      <input
        required
        type="email"
        placeholder="Email"
        className="input"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />
      <input
        placeholder="Phone"
        className="input"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />
      <input
        placeholder="Resale certificate number"
        className="input"
        value={form.resaleCertNumber}
        onChange={(e) => update("resaleCertNumber", e.target.value)}
      />
      <input
        placeholder="Business license number"
        className="input sm:col-span-2"
        value={form.businessLicenseNumber}
        onChange={(e) => update("businessLicenseNumber", e.target.value)}
      />
      <textarea
        placeholder="Anything else we should know?"
        className="input min-h-24 sm:col-span-2"
        value={form.notes}
        onChange={(e) => update("notes", e.target.value)}
      />
      {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-50 sm:col-span-2 sm:w-fit"
      >
        {submitting ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
