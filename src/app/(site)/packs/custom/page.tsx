import { getCurrentUser } from "@/lib/auth";
import { getCitiesWithServices, getServicesForCity, type CityService } from "@/lib/custom-pack-queries";
import { CustomPackBuilder } from "@/components/public/custom-pack-builder";
import { PageHero } from "@/components/public/page-hero";
import { getI18n } from "@/lib/i18n.server";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.customPack.metaTitle,
    description: dict.customPack.metaDescription,
    alternates: alternatesFor("/packs/custom"),
  };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CustomPackPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const citySlug = str(sp.city);

  const [user, cities, { dict }] = await Promise.all([getCurrentUser(), getCitiesWithServices(), getI18n()]);
  const t = dict.customPack;

  // Charge les services de chaque ville (echelle MVP)
  const servicesByCity: Record<string, CityService[]> = {};
  await Promise.all(
    cities.map(async (c) => {
      servicesByCity[c.name] = await getServicesForCity(c.name);
    })
  );

  const initialCityName = citySlug ? cities.find((c) => c.slug === citySlug)?.name : undefined;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.subtitle} />

      <div className="container-page py-10 md:py-14">
        {cities.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[1.75rem] border border-dashed border-sand-400/70 bg-sand-50/70 p-10 text-center text-muted">
            {t.empty}
          </div>
        ) : (
          <CustomPackBuilder
            cities={cities}
            servicesByCity={servicesByCity}
            initialCityName={initialCityName}
            defaultContact={{
              name: user ? `${user.firstName} ${user.lastName}` : "",
              email: user?.email ?? "",
              phone: user?.phone ?? "",
            }}
          />
        )}
      </div>
    </>
  );
}
