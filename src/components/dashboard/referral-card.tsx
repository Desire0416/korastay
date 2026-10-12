"use client";

import * as React from "react";
import { Gift, Copy, Check } from "lucide-react";
import { Motif } from "@/components/brand/motif";
import { useI18n } from "@/components/i18n/provider";

export function ReferralCard({ code, link, count }: { code: string; link: string; count: number }) {
  const dict = useI18n();
  const c = dict.dashAccount.components;
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
    <div className="grain relative mt-10 overflow-hidden rounded-[1.75rem] bg-terracotta p-6 text-white shadow-soft sm:p-8">
      <Motif variant="bogolan" fade="bottom" className="text-white/[0.08]" />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-white/15 text-gold-200">
          <Gift className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-2xl">{c.referralTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/80">
            {c.referralText}
            {count > 0 && (count > 1 ? c.referralCount.replace("{n}", String(count)) : c.referralCountOne)}
          </p>
        </div>
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-foreground">
          <div>
            <span className="eyebrow block text-[9.5px] text-muted">{c.yourCode}</span>
            <span className="font-display text-xl tracking-widest text-terracotta">{code}</span>
          </div>
          <button type="button" onClick={() => copy(code, "code")} className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
            {copied === "code" ? <><Check className="h-3.5 w-3.5" /> {c.copied}</> : <><Copy className="h-3.5 w-3.5" /> {c.copy}</>}
          </button>
        </div>
        <button
          type="button"
          onClick={() => copy(link, "link")}
          className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3 text-left ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/15"
        >
          <span className="min-w-0">
            <span className="eyebrow block text-[9.5px] text-white/70">{c.inviteLink}</span>
            <span className="block truncate text-sm text-white">{link}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gold-200">
            {copied === "link" ? <><Check className="h-3.5 w-3.5" /> {c.copied}</> : <><Copy className="h-3.5 w-3.5" /> {c.copy}</>}
          </span>
        </button>
      </div>
    </div>
  );
}
