import Link from "next/link";
import { Heart, Compass, Award, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "A propos",
  description: "KoraStay, la plateforme ouest-africaine de réservation de résidences vérifiées et de séjours accompagnes.",
};

const VALUES = [
  { icon: Award, title: "Confiance", text: "Chaque résidence vérifiée, chaque partenaire selectionne, chaque promesse tenue." },
  { icon: Compass, title: "Ancrage local", text: "Construit pour les realites des villes ivoiriennes et ouest-africaines." },
  { icon: Sparkles, title: "Excellence", text: "Un standard eleve sur les résidences, les packs et le service client." },
  { icon: Heart, title: "Proximité", text: "Une assistance humaine avant, pendant et après le séjour." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-16 text-center">
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            La plateforme ouest-africaine du séjour vérifié
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            KoraStay simplifie la réservation de résidences meublées vérifiées et
            l'organisation de séjours authentiques, professionnels ou touristiques,
            d'abord en Côte d'Ivoire puis dans toute l'Afrique de l'Ouest.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-4xl border border-border bg-surface p-8 shadow-soft">
            <h2 className="font-display text-2xl font-semibold text-foreground">Notre mission</h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              Offrir aux voyageurs, familles, professionnels, entreprises, touristes
              locaux et membres de la diaspora une solution simple, sure et complète
              pour réserver un hébergement fiable et organiser leur séjour, avec l'appui
              d'un réseau local de propriétaires, guides, restaurants et transporteurs vérifiés.
            </p>
          </div>
          <div className="rounded-4xl gradient-brand p-8 text-white">
            <h2 className="font-display text-2xl font-semibold">Notre vision</h2>
            <p className="mt-3 leading-relaxed text-white/85">
              Devenir la plateforme de référence en Afrique de l'Ouest pour la réservation
              de résidences meublées vérifiées et l'organisation de séjours touristiques,
              professionnels ou familiaux avec accompagnement local.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="container-page">
          <h2 className="mb-8 text-center font-display text-3xl font-semibold text-foreground">Nos valeurs</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-3xl border border-border bg-background p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold text-foreground">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex flex-col items-center rounded-4xl border border-border bg-surface p-10 text-center shadow-soft">
          <Users className="h-10 w-10 text-brand-600" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Rejoignez l'aventure KoraStay</h2>
          <p className="mt-2 max-w-md text-muted">Voyageur, propriétaire ou partenaire : il y a une place pour vous.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link href="/residences">Explorer les résidences <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link href="/devenir-proprietaire">Devenir propriétaire</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
