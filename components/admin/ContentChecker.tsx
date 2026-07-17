"use client";

import { useState } from "react";
import { lintContent } from "@/lib/compliance/content-lint";
import type { BannedTerm } from "@/lib/types";

export function ContentChecker({ bannedTerms }: { bannedTerms: BannedTerm[] }) {
  const [text, setText] = useState("");
  const flags = lintContent(text, bannedTerms);

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="input min-h-32"
        placeholder="Paste a product description, blog post, or ad copy here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {text.trim() && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            flags.length > 0 ? "border-gold/30 bg-gold/10 text-gold" : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          {flags.length === 0 ? (
            <p>No flagged terms found.</p>
          ) : (
            <>
              <p className="mb-1 font-semibold">{flags.length} term(s) flagged:</p>
              <ul className="flex flex-col gap-1">
                {flags.map((f, i) => (
                  <li key={i}>
                    &ldquo;{f.phrase}&rdquo; &mdash; {f.category.replace(/_/g, " ")} ({f.severity}){" "}
                    {f.notes && <span className="text-foreground/50">{f.notes}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
