import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { Motif } from "@/components/brand/motif";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.faq.metaTitle, description: dict.pages.faq.metaDescription, alternates: alternatesFor("/faq") };
}

export default async function FaqPage() {
  const { locale, dict } = await getI18n();
  const t = dict.pages.faq;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.subtitle} />

      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
          {/* Sommaire */}
          <nav className="hidden lg:block">
            <ul className="sticky top-[calc(var(--header-h)+2rem)] space-y-1">
              {t.sections.map((section, i) => (
                <li key={section.title}>
                  <a href={`#faq-${i}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/70 transition-colors hover:bg-sand-100 hover:text-ink">
                    <span className="font-display text-base italic text-terracotta">0{i + 1}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-14">
            {t.sections.map((section, si) => (
              <section key={section.title} id={`faq-${si}`} className="scroll-mt-[calc(var(--header-h)+2rem)]">
                <h2 className="mb-5 flex items-baseline gap-3 font-display text-[1.75rem] font-normal text-foreground">
                  <span className="text-lg italic text-terracotta">0{si + 1}</span>
                  {section.title}
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} value={`${si}-${i}`}>
                      <AccordionTrigger>{item.q}</AccordionTrigger>
                      <AccordionContent>{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}

            <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-500 p-9 text-white">
              <Motif variant="dots" className="text-white/10" />
              <h3 className="relative font-display text-2xl">{t.moreTitle}</h3>
              <p className="relative mt-1.5 text-white/80">{t.moreText}</p>
              <Button asChild variant="white" className="relative mt-6">
                <Link href={localePath("/contact", locale)}>{t.moreCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
