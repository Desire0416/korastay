"use client";

import * as React from "react";
import { Gift, Copy, Check } from "lucide-react";

export function ReferralCard({ code, link, count }: { code: string; link: string; count: number }) {
  const [copied, setCopied] = React.useState<"code" | "link" | null>(null);

  const copy = async (text: string, what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-surface p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white">
          <Gift className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-foreground">Parrainez vos proches 🎁</h2>
          <p className="mt-0.5 text-sm text-muted">
            Vos filleuls obtiennent <strong className="text-foreground">−5 %</strong> sur leur première réservation.
            {count > 0 && (
              <> Vous avez déjà parrainé <strong className="text-foreground">{count}</strong> {count > 1 ? "personnes" : "personne"}.</>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
          <div>
            <span className="block text-2xs font-bold uppercase tracking-wide text-muted">Votre code</span>
            <span className="font-display text-lg font-bold tracking-widest text-brand-700">{code}</span>
          </div>
          <button type="button" onClick={() => copy(code, "code")} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
            {copied === "code" ? <><Check className="h-3.5 w-3.5" /> Copié</> : <><Copy className="h-3.5 w-3.5" /> Copier</>}
          </button>
        </div>
        <button
          type="button"
          onClick={() => copy(link, "link")}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-brand-300"
        >
          <span className="min-w-0">
            <span className="block text-2xs font-bold uppercase tracking-wide text-muted">Lien d&apos;invitation</span>
            <span className="block truncate text-sm text-foreground">{link}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600">
            {copied === "link" ? <><Check className="h-3.5 w-3.5" /> Copié</> : <><Copy className="h-3.5 w-3.5" /> Copier</>}
          </span>
        </button>
      </div>
    </div>
  );
}
