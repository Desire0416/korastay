import { getAllDestinations } from "@/lib/queries";
import { DestinationCard } from "@/components/public/destination-card";

export const metadata = {
  title: "Destinations",
  description: "Decouvrez les villes ou KoraStay vous accueille, de Daloa a Assinie.",
};

export default async function DestinationsPage() {
  const destinations = await getAllDestinations();

  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-9 text-center md:py-16">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Nos destinations
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted md:text-base">
            Des montagnes de Man aux plages d'Assinie, explorez la richesse de
            l'Afrique de l'Ouest avec des sejours verifies.
          </p>
        </div>
      </section>

      <div className="container-page py-7 md:py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {destinations.map((d) => (
            <DestinationCard key={d.slug} destination={d} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
