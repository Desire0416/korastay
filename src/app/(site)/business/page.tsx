import { Receipt, Wifi, Headset, FileSignature, Users, ListChecks } from "lucide-react";
import { LeadForm } from "@/components/public/lead-form";
import { SectionHeading } from "@/components/public/section-heading";
import { Motif, Ornament } from "@/components/brand/motif";
import { submitBusinessRequest } from "@/server/actions/leads";
import { getI18n } from "@/lib/i18n.server";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.business.metaTitle, description: dict.pages.business.metaDescription, alternates: alternatesFor("/business") };
}

const BENEFIT_ICONS = [FileSignature, Receipt, Wifi, Users, ListChecks, Headset];

export default async function BusinessPage() {
  const { dict } = await getI18n();
  const t = dict.pages.business;
  const f = t.fields;

  return (
    <>
      {/* Hero indigo + formulaire de devis */}
      <section className="grain relative overflow-hidden bg-ink-800 text-white">
        <Motif variant="kente" fade="bottom" className="text-white/[0.05]" />
        <div aria-hidden="true" className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-terracotta/20 blur-3xl" />
        <div className="container-page relative grid grid-cols-1 items-start gap-12 py-14 md:py-20 lg:grid-cols-[1fr_1.05fr]">
          <div className="lg:pt-8">
            <p className="eyebrow flex items-center gap-3 text-gold-300">
              <Ornament side="left" />
              {t.eyebrow}
            </p>
            <h1 className="mt-5 text-balance font-display text-[2.6rem] font-normal leading-[1.04] tracking-[-0.02em] md:text-display-md lg:text-display-lg">
              {t.title} <em className="italic text-gold-300">{t.accent}</em>
            </h1>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-white/70">{t.subtitle}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {t.cases.map((c) => (
                <li key={c} className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90">{c}</li>
              ))}
            </ul>
          </div>

          <div id="devis" className="relative scroll-mt-[calc(var(--header-h)+1rem)] overflow-hidden rounded-[2rem] bg-surface p-7 pt-9 text-foreground shadow-float sm:p-9 sm:pt-11">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
              <div className="motif motif-kente text-terracotta/70" />
            </div>
            <h2 className="font-display text-[1.75rem]">{t.quoteTitle}</h2>
            <p className="mb-6 mt-1 text-sm text-muted">{t.quoteDelay}</p>
            <LeadForm
              action={submitBusinessRequest}
              submitLabel={t.submit}
              fields={[
                { name: "organizationName", label: f.organization, required: true, placeholder: f.organizationPlaceholder },
                { name: "organizationType", label: f.type, type: "select", options: f.types, placeholder: f.typePlaceholder },
                { name: "contactName", label: f.contact, required: true, placeholder: f.contactPlaceholder },
                { name: "email", label: f.email, type: "email", required: true, placeholder: f.emailPlaceholder },
                { name: "phone", label: f.phone, type: "tel", placeholder: "+225 ..." },
                { name: "city", label: f.city, placeholder: f.cityPlaceholder },
                { name: "teamSize", label: f.teamSize, type: "number", placeholder: "5" },
                { name: "notes", label: f.needs, type: "textarea", placeholder: f.needsPlaceholder },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeading align="center" title={t.benefitsTitle} accent={t.benefitsAccent} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.benefits.map((b, i) => {
            const BenefitIcon = BENEFIT_ICONS[i] ?? Receipt;
            return (
              <div key={b.title} className="rounded-[1.75rem] border border-border bg-surface p-7 shadow-soft">
                <span className="flex h-14 w-12 items-center justify-center rounded-arch-sm bg-ink text-gold-300">
                  <BenefitIcon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 font-display text-xl text-foreground">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
