import type { BannedTerm } from "@/lib/types";

export type LintFlag = {
  phrase: string;
  category: BannedTerm["category"];
  severity: BannedTerm["severity"];
  notes: string;
};

// Simple case-insensitive phrase matching against the admin-editable
// content_banned_terms list (see /admin/content). This is a starting-point
// tool, not a substitute for a human/attorney review — it catches obvious
// terms, not intent or context.
export function lintContent(text: string, bannedTerms: BannedTerm[]): LintFlag[] {
  const lower = text.toLowerCase();
  const flags: LintFlag[] = [];

  for (const term of bannedTerms) {
    const phrase = term.phrase.toLowerCase().trim();
    if (!phrase) continue;
    if (lower.includes(phrase)) {
      flags.push({ phrase: term.phrase, category: term.category, severity: term.severity, notes: term.notes });
    }
  }

  return flags;
}

// Starter list used to seed content_banned_terms (see supabase/seed.sql) and
// as a fallback if the table is empty/unconfigured. NOT exhaustive — the
// spec explicitly calls for attorney review/expansion of this list before
// relying on it. Three categories, matching the spec's own call-outs:
//   - health_claim: implies curing/treating/preventing disease
//   - paraphernalia_framing: frames a product around illegal-drug use
//   - minor_targeting: language/imagery that could reasonably reach minors
export const STARTER_BANNED_TERMS: Omit<BannedTerm, "id">[] = [
  // Health claims
  { phrase: "cures", category: "health_claim", severity: "block", notes: "Disease-cure claim." },
  { phrase: "treats disease", category: "health_claim", severity: "block", notes: "Disease-treatment claim." },
  { phrase: "prevents disease", category: "health_claim", severity: "block", notes: "Disease-prevention claim." },
  { phrase: "fda approved", category: "health_claim", severity: "block", notes: "Almost certainly a false/misleading claim for this product category." },
  { phrase: "medical grade", category: "health_claim", severity: "warn", notes: "Can imply a medical claim depending on context — review." },
  { phrase: "heals", category: "health_claim", severity: "warn", notes: "Potential health claim — review context." },
  { phrase: "anti-inflammatory", category: "health_claim", severity: "warn", notes: "Medical-sounding claim — review context." },
  { phrase: "reduces anxiety", category: "health_claim", severity: "warn", notes: "Medical/therapeutic claim — review context." },

  // Illegal-drug / paraphernalia framing — flagged regardless of product
  // type, since the spec's concern is specifically that marketing language
  // (not the item itself) is what creates drug-paraphernalia liability.
  { phrase: "marijuana", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug reference." },
  { phrase: "weed", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug reference." },
  { phrase: "cannabis", category: "paraphernalia_framing", severity: "warn", notes: "May be legitimate for hemp-derived SKUs — confirm context before treating as a violation." },
  { phrase: "420", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug culture reference." },
  { phrase: "get high", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug-use framing." },
  { phrase: "stoned", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug-use framing." },
  { phrase: "cocaine", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug reference." },
  { phrase: "heroin", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug reference." },
  { phrase: "meth", category: "paraphernalia_framing", severity: "block", notes: "Illegal-drug reference." },
  { phrase: "bong rip", category: "paraphernalia_framing", severity: "warn", notes: "Framing that leans toward illegal-drug use — review." },
  { phrase: "dab a", category: "paraphernalia_framing", severity: "warn", notes: "Check whether this is framed around legal herb/tobacco use." },

  // Minor-targeting
  { phrase: "cartoon", category: "minor_targeting", severity: "warn", notes: "Imagery/language that could reasonably reach minors — review." },
  { phrase: "candy flavored", category: "minor_targeting", severity: "block", notes: "FDA/FTC watch this closely for vapor products specifically." },
  { phrase: "kid-friendly", category: "minor_targeting", severity: "block", notes: "Directly implies minor-appropriate framing." },
  { phrase: "for kids", category: "minor_targeting", severity: "block", notes: "Directly implies minor-appropriate framing." },
  { phrase: "school", category: "minor_targeting", severity: "warn", notes: "Check context — could reasonably reach minors." },
];
