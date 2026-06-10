import { Home, TrendingUp, ShieldCheck, Calendar, Wallet, BadgeCheck, ArrowRight } from "lucide-react";
import { LeadForm } from "@/components/public/lead-form";
import { submitOwnerApplication } from "@/server/actions/leads";

export const metadata = {
  title: "Devenir proprietaire",
  description: "Publiez votre residence meublee sur KoraStay, gerez votre calendrier et augmentez votre taux d'occupation.",
};

const STEPS = [
  { n: 1, title: "Soumettez votre demande", text: "Remplissez le formulaire avec vos informations et votre bien." },
  { n: 2, title: "Validation KoraStay", text: "Notre equipe verifie et attribue un niveau de qualite." },
  { n: 3, title: "Publiez votre residence", text: "Ajoutez photos, tarifs et equipements depuis votre espace." },
  { n: 4, title: "Recevez des reservations", text: "Gerez votre calendrier et suivez vos revenus en temps reel." },
];

const BENEFITS = [
  { icon: TrendingUp, title: "Plus de reservations", text: "Augmentez votre taux d'occupation avec une audience qualifiee." },
  { icon: Calendar, title: "Gestion simplifiee", text: "Calendrier, tarifs et disponibilites depuis un seul espace." },
  { icon: Wallet, title: "Revenus suivis", text: "Visualisez vos gains et l'historique de vos reservations." },
  { icon: ShieldCheck, title: "Voyageurs verifies", text: "Des reservations payees et securisees par KoraStay." },
];

export default function OwnerLandingPage() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              <Home className="h-3.5 w-3.5" /> Espace proprietaire
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Valorisez votre residence avec KoraStay
            </h1>
            <p className="mt-4 max-w-lg text-muted">
              Rejoignez le reseau de residences verifiees et augmentez vos revenus
              en toute simplicite, partout en Cote d'Ivoire.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-soft">
              <BadgeCheck className="h-8 w-8 text-brand-600" />
              <p className="text-sm text-foreground">
                <span className="font-bold">Badge Residence verifiee</span> : rassurez les
                voyageurs et augmentez vos reservations.
              </p>
            </div>
          </div>

          <div className="rounded-4xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <h2 className="text-xl font-bold text-foreground">Rejoindre le reseau</h2>
            <p className="mb-5 mt-1 text-sm text-muted">Notre equipe vous recontacte sous 48h.</p>
            <LeadForm
              action={submitOwnerApplication}
              submitLabel="Envoyer ma demande"
              fields={[
                { name: "name", label: "Nom complet", required: true, full: true, placeholder: "Votre nom" },
                { name: "email", label: "Email", type: "email", required: true, placeholder: "vous@email.com" },
                { name: "phone", label: "Telephone", type: "tel", required: true, placeholder: "+225 ..." },
                { name: "city", label: "Ville du bien", required: true, placeholder: "Daloa" },
                { name: "residenceCount", label: "Nombre de biens", type: "number", placeholder: "1" },
                { name: "message", label: "Decrivez votre bien", type: "textarea", placeholder: "Type, capacite, equipements..." },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="mb-8 text-center font-display text-3xl font-semibold text-foreground">Comment ca marche</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white">{s.n}</span>
              <h3 className="mt-4 font-bold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-3xl bg-surface-soft p-6">
              <b.icon className="h-7 w-7 text-brand-600" />
              <h3 className="mt-3 font-bold text-foreground">{b.title}</h3>
              <p className="mt-1 text-sm text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
