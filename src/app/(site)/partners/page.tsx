import Link from "next/link";
import {
  Handshake, Compass, Car, UtensilsCrossed, Camera, TrendingUp, ShieldCheck, Wallet, ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { becomePartnerAction } from "@/server/actions/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const PARTNER_OPTIONS = [
  { value: "GUIDE", label: "Guide touristique" },
  { value: "TRANSPORT", label: "Chauffeur / Transport" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "ACTIVITY", label: "Activité / expérience" },
  { value: "OTHER", label: "Autre prestataire" },
];

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

export default async function PartnersPage() {
  const user = await getCurrentUser();
  const isPartner = user?.role === "PARTNER";
  const isStaff = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

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
            {!user ? (
              // Visiteur sans compte : la candidature EST la creation du compte partenaire.
              <RegisterForm
                defaultType="PARTNER"
                lockType
                title="Créer mon compte partenaire"
                subtitle="Choisissez votre métier et créez votre compte. Notre équipe valide votre profil sous 48h."
              />
            ) : isPartner ? (
              <div className="py-4 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Handshake className="h-7 w-7" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground">Votre espace partenaire</h2>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                  Retrouvez vos missions, vos services et vos revenus dans votre espace.
                </p>
                <Button asChild size="lg" className="mt-5">
                  <Link href="/partner">Accéder à mon espace <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            ) : isStaff ? (
              <div className="py-4 text-center">
                <h2 className="text-xl font-bold text-foreground">Gestion des partenaires</h2>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">Vérifiez et gérez les partenaires depuis l'administration.</p>
                <Button asChild size="lg" className="mt-5"><Link href="/admin/partners">Ouvrir l'administration <ArrowRight className="h-4 w-4" /></Link></Button>
              </div>
            ) : (
              // Compte existant (voyageur, etc.) : on active l'espace partenaire avec le metier choisi.
              <div className="py-2">
                <h2 className="text-xl font-bold text-foreground">Activez votre espace partenaire</h2>
                <p className="mb-5 mt-1.5 text-sm text-muted">
                  Bonjour {user.firstName}, choisissez votre métier : votre compte deviendra un compte <strong>partenaire</strong>.
                </p>
                <form action={becomePartnerAction} className="space-y-4">
                  <div>
                    <label htmlFor="partnerType" className="mb-1.5 block text-sm font-semibold text-foreground">
                      Type de partenaire
                    </label>
                    <select
                      id="partnerType"
                      name="partnerType"
                      required
                      defaultValue=""
                      className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground focus-visible:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
                    >
                      <option value="" disabled>Choisir votre activité</option>
                      {PARTNER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Activer mon espace partenaire <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
