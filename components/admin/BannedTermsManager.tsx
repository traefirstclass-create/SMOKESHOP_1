"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { addBannedTermAction, deleteBannedTermAction } from "@/app/admin/(protected)/content/actions";
import type { BannedTerm } from "@/lib/types";

const CATEGORIES: BannedTerm["category"][] = ["health_claim", "paraphernalia_framing", "minor_targeting"];

export function BannedTermsManager({ terms }: { terms: BannedTerm[] }) {
  const [localTerms, setLocalTerms] = useState(terms);
  const [phrase, setPhrase] = useState("");
  const [category, setCategory] = useState<BannedTerm["category"]>("health_claim");
  const [severity, setSeverity] = useState<BannedTerm["severity"]>("warn");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!phrase.trim()) return;
    setSaving(true);
    const result = await addBannedTermAction({ phrase: phrase.trim(), category, severity, notes });
    setSaving(false);
    if (result.success) {
      setLocalTerms((prev) => [...prev, { id: crypto.randomUUID(), phrase, category, severity, notes }]);
      setPhrase("");
      setNotes("");
    }
  }

  async function handleDelete(id: string) {
    setLocalTerms((prev) => prev.filter((t) => t.id !== id));
    await deleteBannedTermAction(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_1fr_auto]">
        <input className="input" placeholder="Phrase" value={phrase} onChange={(e) => setPhrase(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as BannedTerm["category"])}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value as BannedTerm["severity"])}>
          <option value="warn">warn</option>
          <option value="block">block</option>
        </select>
        <input className="input" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !phrase.trim()}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <ul className="flex flex-col gap-1">
        {localTerms.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            <span>
              &ldquo;{t.phrase}&rdquo;{" "}
              <span className="text-xs text-foreground/40">
                ({t.category.replace(/_/g, " ")}, {t.severity})
              </span>
              {t.notes && <span className="ml-2 text-xs text-foreground/40">{t.notes}</span>}
            </span>
            <button onClick={() => handleDelete(t.id)} aria-label={`Remove ${t.phrase}`}>
              <Trash2 className="h-4 w-4 text-foreground/40 transition hover:text-red-400" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
