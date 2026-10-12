"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, AlertCircle, Pause, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { validateResidence, requestResidenceChanges, setResidenceStatus } from "@/server/actions/admin";
import { useI18n } from "@/components/i18n/provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LEVELS = [
  { value: "ESSENTIAL", stars: 2 },
  { value: "COMFORT", stars: 3 },
  { value: "PREMIUM", stars: 4 },
];

export function ResidenceValidationPanel({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashAdmin.catalog.validation;
  const [pending, start] = React.useTransition();
  const [level, setLevel] = React.useState("COMFORT");
  const [note, setNote] = React.useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(res.message ?? dict.dash.common.done);
        router.refresh();
      } else toast.error(res.error ?? dict.dash.common.error);
    });

  const needsValidation = status === "PENDING_VALIDATION" || status === "DRAFT";
  const isPublished = status === "PUBLISHED";

  return (
    <section className="rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-soft">
      <h2 className="flex items-center gap-2.5 font-display text-lg text-foreground">
        <ShieldCheck className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.title}
      </h2>

      {needsValidation && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-foreground">{t.level}</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                className={cn(
                  "rounded-xl border p-3 text-center transition-colors",
                  level === l.value ? "border-brand-500 bg-brand-50" : "border-ink/15 bg-white hover:border-ink/30"
                )}
              >
                <p className="text-sm font-bold text-foreground">{dict.enums.quality[l.value] ?? l.value}</p>
                <p className="text-xs text-gold-500">{"★".repeat(l.stars)}</p>
              </button>
            ))}
          </div>
          <Button className="mt-3 w-full" loading={pending} onClick={() => run(() => validateResidence(id, level))}>
            <BadgeCheck className="h-4 w-4" /> {t.validate}
          </Button>

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-sm font-semibold text-foreground">{t.requestChanges}</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} rows={2} />
            <Button variant="outline" className="mt-2 w-full" loading={pending} onClick={() => run(() => requestResidenceChanges(id, note))}>
              <AlertCircle className="h-4 w-4" /> {t.requestChanges}
            </Button>
          </div>
        </div>
      )}

      {!needsValidation && (
        <div className="mt-4 space-y-2">
          {isPublished ? (
            <Button variant="outline" className="w-full" loading={pending} onClick={() => run(() => setResidenceStatus(id, "UNPUBLISHED"))}>
              <EyeOff className="h-4 w-4" /> {t.unpublish}
            </Button>
          ) : (
            <Button className="w-full" loading={pending} onClick={() => run(() => setResidenceStatus(id, "PUBLISHED"))}>
              <Eye className="h-4 w-4" /> {t.publish}
            </Button>
          )}
          <Button variant="outline" className="w-full border-danger-200 text-danger-600 hover:bg-danger-50" loading={pending} onClick={() => run(() => setResidenceStatus(id, "SUSPENDED"))}>
            <Pause className="h-4 w-4" /> {t.suspend}
          </Button>
        </div>
      )}
    </section>
  );
}
