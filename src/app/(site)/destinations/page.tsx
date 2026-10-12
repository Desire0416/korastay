import { getAllDestinations } from "@/lib/queries";
import { DestinationCard } from "@/components/public/destination-card";
import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { getI18n } from "@/lib/i18n.server";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.destinations.metaTitle,
    description: dict.destinations.metaDescription,
    alternates: alternatesFor("/destinations"),
  };
}

export default async function DestinationsPage() {
  const [destinations, { dict }] = await Promise.all([getAllDestinations(), getI18n()]);
  const t = dict.destinations;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.subtitle} />
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
          {destinations.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 5) * 0.04}>
              <DestinationCard destination={d} shape="arch" />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
