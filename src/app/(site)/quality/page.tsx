import { ShieldCheck, ClipboardCheck, Star, BadgeCheck, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Charte qualité",
  description: "Découvrez le processus de vérification KoraStay et les standards de nos résidences.",
};

const PROCESS = [
  { n: 1, title: "Soumission du dossier", text: "Le propriétaire fournit photos, description, tarifs et justificatifs." },
  { n: 2, title: "Examen sous 5 jours", text: "Notre équipe vérifié la conformite, la sécurité et les équipements." },
  { n: 3, title: "Attribution du niveau", text: "Essentiel, Confort ou Premium selon les critères remplis." },
  { n: 4, title: "Badge vérifié & publication", text: "La résidence obtient le badge KoraStay et devient réservable." },
];

const LEVELS = [
  { name: "Essentiel", stars: 2, tone: "border-border", text: "Équipements de base, propre et fonctionnel." },
  { name: "Confort", stars: 3, tone: "border-brand-300 ring-1 ring-brand-200", text: "Climatisation, WiFi, bonne literie, localisation centrale." },
  { name: "Premium", stars: 4, tone: "border-gold-300 ring-1 ring-gold-200", text: "Mobilier moderne, decoration soignee, services inclus." },
];

const EQUIPMENT = [
  "Literie propre, linge lave entre chaque séjour",
  "Salle de bain fonctionnelle, eau chaude si annoncee",
  "Cuisine équipée : refrigerateur, plaques, vaisselle",
  "Installation électrique conforme et eclairage suffisant",
  "Ventilation ou climatisation selon standing",
  "Sécurité : serrure sure, environnement raisonnable",
  "Nettoyage complet avant chaque arrivée",
  "WiFi recommandé (obligatoire en Confort et Premium)",
];

export default function QualityPage() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Charte qualité
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            La confiance, vérifiée a chaque séjour
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Chaque résidence KoraStay est contrôlée selon des standards stricts avant
            d'obtenir le badge <span className="font-semibold text-brand-700">Résidence vérifiée</span>.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="mb-8 flex items-center justify-center gap-2 text-center font-display text-3xl font-semibold text-foreground">
          <ClipboardCheck className="h-7 w-7 text-brand-600" /> Le processus de vérification
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p) => (
            <div key={p.n} className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white">{p.n}</span>
              <h3 className="mt-4 font-bold text-foreground">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="container-page">
          <h2 className="mb-8 flex items-center justify-center gap-2 text-center font-display text-3xl font-semibold text-foreground">
            <Star className="h-7 w-7 text-gold-500" /> Les niveaux de qualité
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {LEVELS.map((l) => (
              <div key={l.name} className={`rounded-3xl border bg-background p-6 ${l.tone}`}>
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({ length: l.stars }).map((_, i) => <Star key={i} className="h-5 w-5 fill-gold-500" />)}
                </div>
                <h3 className="mt-3 text-lg font-bold text-foreground">{l.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{l.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-foreground">
              <Sparkles className="h-6 w-6 text-brand-600" /> Équipements obligatoires
            </h2>
            <ul className="mt-5 space-y-3">
              {EQUIPMENT.map((e) => (
                <li key={e} className="flex items-start gap-2.5 text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-4xl gradient-brand p-8 text-white">
            <BadgeCheck className="h-12 w-12 text-gold-400" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Badge Résidence vérifiée KoraStay</h3>
            <p className="mt-2 text-white/80">
              Ce badge garantit qu'une résidence a ete contrôlée et respecte nos standards
              de propreté, sécurité, équipement et conformite. En cas de non-conformite,
              reclamation grave ou photos trompeuses, la résidence peut être suspendue.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
