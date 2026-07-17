"use client";

import { useState } from "react";
import { saveWarningTextAction } from "@/app/admin/(protected)/content/actions";

export function WarningTextEditor({
  label,
  settingKey,
  initialValue,
}: {
  label: string;
  settingKey: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveWarningTextAction(settingKey, value);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <textarea className="input min-h-24" value={value} onChange={(e) => setValue(e.target.value)} />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || value === initialValue}
        className="mt-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium transition hover:border-accent/50 disabled:opacity-30"
      >
        {saving ? "Saving..." : saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
