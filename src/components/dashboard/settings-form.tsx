"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CreditCard, ChevronRight, BarChart3, Contact, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveSettings, type SettingsResult } from "@/server/actions/settings";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

interface Props {
  contactEmail: string;
  contactPhone: string;
  announcement: string;
  statsVisible: boolean;
}

const panel = "rounded-[1.5rem] border border-border/80 bg-surface p-6 shadow-soft";
const title = "flex items-center gap-2.5 font-display text-xl text-foreground";

export function SettingsForm({ contactEmail, contactPhone, announcement, statsVisible }: Props) {
  const dict = useI18n();
  const t = dict.dashAdmin.system.settingsForm;
  const [state, action, pending] = useActionState<SettingsResult, FormData>(saveSettings, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <Link
        href={localePath("/admin/settings/payments", dict.locale)}
        className="group flex items-center justify-between gap-3 rounded-[1.5rem] bg-ink p-5 text-white shadow-card transition-transform hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-4">
          <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-gold-400 text-ink-900">
            <CreditCard className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-lg">{t.paymentRules}</span>
            <span className="block text-sm text-white/70">{t.paymentRulesText}</span>
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-white/60 transition-transform group-hover:translate-x-1" />
      </Link>

      <section className={panel}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={title}>
              <BarChart3 className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.statsTitle}
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted">{t.statsText}</p>
            <p className="mt-2 text-xs font-semibold">
              {t.current} <span className={statsVisible ? "text-success" : "text-muted"}>{statsVisible ? t.statsShown : t.statsHidden}</span>
            </p>
          </div>
          <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center" title={t.statsToggle}>
            <input type="checkbox" name="community_stats_visible" value="1" defaultChecked={statsVisible} className="peer sr-only" aria-label={t.statsToggle} />
            <span className="h-6 w-11 rounded-full bg-sand-300 transition-colors peer-checked:bg-brand-500" />
            <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
      </section>

      <section className={panel}>
        <h2 className={`${title} mb-4`}>
          <Contact className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.contactTitle}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.contactEmail} htmlFor="contact_email">
            <Input id="contact_email" name="contact_email" type="email" defaultValue={contactEmail} />
          </Field>
          <Field label={t.contactPhone} htmlFor="contact_phone">
            <Input id="contact_phone" name="contact_phone" defaultValue={contactPhone} />
          </Field>
        </div>
      </section>

      <section className={panel}>
        <h2 className={title}>
          <Megaphone className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.announcementTitle}
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.announcementText}</p>
        <Textarea name="announcement" defaultValue={announcement} rows={2} placeholder={t.announcementPh} />
      </section>

      <Button type="submit" size="lg" loading={pending}>{t.save}</Button>
    </form>
  );
}
