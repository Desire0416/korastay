import {
  Handshake, Compass, Car, UtensilsCrossed, Camera, TrendingUp, ShieldCheck, Wallet,
} from "lucide-react";
import { LeadForm } from "@/components/public/lead-form";
import { submitPartnerApplication } from "@/server/actions/leads";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "Devenir partenaire",
  description: "Rejoignez le réseau KoraStay Partners : guides, transporteurs, restaurants et prestataires d'activités.",
};

const TYPES = [
  { icon: Compass, label: "Guides touristiques" },
  { icon: Car, label: "Transporteurs" },
  { icon: UtensilsCrossed, label: "Restaurants" },
  { icon: Camera, label: "Activités & expériences" },
];

const BENEFITS = [
  { icon: TrendingUp, title: "Plus de visibilite", text: "Touchez des voyageurs qualifies a la recherche d'expériences locales." },
  { icon: Wallet, title: "Revenus réguliers", text: "Recevez des missions et suivez vos revenus depuis votre espace." },
  { icon: ShieldCheck, title: "Réseau de confiance", text: "Beneficiez du label KoraStay et de la confiance qu'il inspire." },
];

const FAQ = [
  { q: "Comment devenir partenaire ?", a: "Remplissez le formulaire, notre équipe etudie votre profil puis valide votre compte. Vous completez ensuite vos services et disponibilités." },
  { q: "Y a-t-il des frais d'inscription ?", a: "Non. L'inscription au réseau KoraStay Partners est gratuite. Une commission s'applique uniquement sur les missions realisees." },
  { q: "Quels documents fournir ?", a: "Une pièce d'identité, vos justificatifs d'activité et quelques photos de vos prestations." },
];

export default function PartnersPage() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-sm font-semibold text-gold-700">
            <Handshake className="h-3.5 w-3.5" /> KoraStay Partners
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Rejoignez le réseau des partenaires locaux
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Guides, transporteurs, restaurants et prestataires : developpez votre activité
            avec KoraStay et offrez des expériences authentiques.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {TYPES.map((t) => (
              <div key={t.label} className="rounded-2xl bg-surface p-4 shadow-soft">
                <t.icon className="mx-auto h-7 w-7 text-brand-600" />
                <p className="mt-2 text-sm font-semibold text-foreground">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold text-foreground">Les avantages</h2>
            <div className="mt-6 space-y-5">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <b.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{b.title}</h3>
                    <p className="text-sm text-muted">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-10 mb-4 font-display text-2xl font-semibold text-foreground">Questions frequentes</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`p-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="rounded-4xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <h2 className="text-xl font-bold text-foreground">Devenir partenaire</h2>
            <p className="mb-5 mt-1 text-sm text-muted">Inscription gratuite, validation sous 48h.</p>
            <LeadForm
              action={submitPartnerApplication}
              submitLabel="Envoyer ma candidature"
              fields={[
                { name: "businessName", label: "Nom / Enseigne", required: true, full: true, placeholder: "Votre activité" },
                { name: "type", label: "Type de partenaire", type: "select", required: true, placeholder: "Choisir", options: [
                  { value: "GUIDE", label: "Guide touristique" },
                  { value: "TRANSPORT", label: "Transporteur" },
                  { value: "RESTAURANT", label: "Restaurant" },
                  { value: "ACTIVITY", label: "Activite / experience" },
                  { value: "OTHER", label: "Autre" },
                ] },
                { name: "city", label: "Ville", required: true, placeholder: "Daloa" },
                { name: "email", label: "Email", type: "email", required: true, placeholder: "vous@email.com" },
                { name: "phone", label: "Téléphone", type: "tel", required: true, placeholder: "+225 ..." },
                { name: "message", label: "Présentez votre activité", type: "textarea", placeholder: "Vos services, votre expérience..." },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
