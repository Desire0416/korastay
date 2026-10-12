import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { LeadForm } from "@/components/public/lead-form";
import { PageHero } from "@/components/public/page-hero";
import { submitContact } from "@/server/actions/leads";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { getI18n } from "@/lib/i18n.server";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.contact.metaTitle, description: dict.pages.contact.metaDescription, alternates: alternatesFor("/contact") };
}

export default async function ContactPage() {
  const { dict } = await getI18n();
  const t = dict.pages.contact;
  const channels = [
    { icon: Mail, label: t.email, value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { icon: Phone, label: t.phone, value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}` },
    { icon: MapPin, label: t.zone, value: t.zoneValue },
    { icon: Clock, label: t.hours, value: t.hoursValue },
  ];

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.subtitle} />

      <div className="container-page py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1.45fr]">
          <div className="space-y-3">
            {channels.map((c) => (
              <div key={c.label} className="flex items-center gap-4 rounded-[1.25rem] border border-border bg-surface p-5">
                <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-terracotta-50 text-terracotta ring-1 ring-inset ring-terracotta-200/60">
                  <c.icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow text-[10px] text-muted">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="font-display text-lg text-foreground hover:text-terracotta">{c.value}</a>
                  ) : (
                    <p className="font-display text-lg text-foreground">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-7 pt-9 shadow-card sm:p-9 sm:pt-11">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
              <div className="motif motif-kente text-terracotta/70" />
            </div>
            <h2 className="mb-6 font-display text-[1.75rem] text-foreground">{t.formTitle}</h2>
            <LeadForm
              action={submitContact}
              submitLabel={t.submit}
              fields={[
                { name: "name", label: t.name, required: true, placeholder: t.namePlaceholder },
                { name: "email", label: t.email, type: "email", required: true, placeholder: t.emailPlaceholder },
                { name: "subject", label: t.subject, required: true, full: true, placeholder: t.subjectPlaceholder },
                { name: "message", label: t.message, type: "textarea", required: true, placeholder: t.messagePlaceholder },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
