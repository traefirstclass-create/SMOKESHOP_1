import { Handshake } from "lucide-react";
import { TradeApplicationForm } from "@/components/TradeApplicationForm";

export const metadata = {
  title: "Trade / Wholesale Program | Ali Baba Smoke Shop",
};

export default function TradeApplyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-center gap-2 text-gold">
        <Handshake className="h-5 w-5" />
        <p className="text-sm font-semibold uppercase tracking-widest">Trade Program</p>
      </div>
      <h1 className="text-3xl font-bold">Wholesale &amp; Trade Accounts</h1>
      <p className="mt-4 leading-relaxed text-foreground/70">
        We&apos;re building out a wholesale program for licensed retail businesses. There&apos;s no
        self-serve wholesale storefront yet — submit your business details below and our team will
        follow up directly to discuss wholesale ordering.
      </p>
      <div className="mt-8">
        <TradeApplicationForm />
      </div>
    </div>
  );
}
