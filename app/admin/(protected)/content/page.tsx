import { getBannedTerms } from "@/lib/compliance/banned-terms";
import { getComplianceSetting, WARNING_RESTRICTED_DTC_KEY, WARNING_PICKUP_ONLY_KEY } from "@/lib/compliance/settings";
import { ContentChecker } from "@/components/admin/ContentChecker";
import { BannedTermsManager } from "@/components/admin/BannedTermsManager";
import { WarningTextEditor } from "@/components/admin/WarningTextEditor";

export const metadata = { title: "Content Check | Admin" };

export default async function ContentCheckPage() {
  const [bannedTerms, restrictedWarning, pickupWarning] = await Promise.all([
    getBannedTerms(),
    getComplianceSetting(WARNING_RESTRICTED_DTC_KEY),
    getComplianceSetting(WARNING_PICKUP_ONLY_KEY),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">Content Check</h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground/60">
          Check draft copy against the banned-terms list before publishing product descriptions,
          blog posts, or ad copy. This is a starting-point tool, not a substitute for legal review.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Check draft copy</h2>
        <ContentChecker bannedTerms={bannedTerms} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Warning-label text</h2>
        <p className="mb-4 max-w-2xl text-sm text-foreground/60">
          Rendered automatically on qualifying product pages — never invent this copy yourself; an
          attorney needs to supply the real language (e.g. Florida&apos;s required tobacco shipping
          warning for RESTRICTED_DTC products).
        </p>
        <div className="flex flex-col gap-6">
          <WarningTextEditor
            label="RESTRICTED_DTC product pages"
            settingKey={WARNING_RESTRICTED_DTC_KEY}
            initialValue={restrictedWarning}
          />
          <WarningTextEditor
            label="PICKUP_ONLY product pages"
            settingKey={WARNING_PICKUP_ONLY_KEY}
            initialValue={pickupWarning}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Banned terms list</h2>
        <p className="mb-4 max-w-2xl text-sm text-foreground/60">
          Starter list only — have an attorney review and expand this before relying on it.
        </p>
        <BannedTermsManager terms={bannedTerms} />
      </section>
    </div>
  );
}
