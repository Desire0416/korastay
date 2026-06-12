import { Wand2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCitiesWithServices, getServicesForCity, type CityService } from "@/lib/custom-pack-queries";
import { CustomPackBuilder } from "@/components/public/custom-pack-builder";

export const metadata = {
  title: "Composer mon pack",
  description: "Composez votre pack sur mesure : activités, guides, transport et restauration locaux. Voyez le prix et soumettez votre demande.",
};

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CustomPackPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const citySlug = str(sp.city);

  const [user, cities] = await Promise.all([getCurrentUser(), getCitiesWithServices()]);

  // Charge les services de chaque ville (echelle MVP)
  const servicesByCity: Record<string, CityService[]> = {};
  await Promise.all(
    cities.map(async (c) => {
      servicesByCity[c.name] = await getServicesForCity(c.name);
    })
  );

  const initialCityName = citySlug ? cities.find((c) => c.slug === citySlug)?.name : undefined;

  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            <Wand2 className="h-3.5 w-3.5" /> Sur mesure
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Composez votre pack ideal
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Choisissez votre destination, ajoutez les activités et partenaires locaux qui vous plaisent,
            visualisez le prix et soumettez votre pack pour validation.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        {cities.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border bg-surface-soft/40 p-10 text-center text-muted">
            Aucun partenaire n'est encore disponible. Revenez bientôt !
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
    </div>
  );
}
