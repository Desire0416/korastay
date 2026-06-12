import Link from "next/link";
import { Home, TrendingUp, ShieldCheck, Calendar, Wallet, BadgeCheck, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { becomeOwnerAction } from "@/server/actions/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Devenir propriétaire",
  description: "Créez votre compte propriétaire sur KoraStay, publiez votre résidence meublée et gérez votre calendrier.",
};

const STEPS = [
  { n: 1, title: "Soumettez votre demande", text: "Remplissez le formulaire avec vos informations et votre bien." },
  { n: 2, title: "Validation KoraStay", text: "Notre équipe vérifié et attribue un niveau de qualité." },
  { n: 3, title: "Publiez votre résidence", text: "Ajoutez photos, tarifs et équipements depuis votre espace." },
  { n: 4, title: "Recevez des réservations", text: "Gérez votre calendrier et suivez vos revenus en temps reel." },
];

const BENEFITS = [
  { icon: TrendingUp, title: "Plus de réservations", text: "Augmentez votre taux d'occupation avec une audience qualifiee." },
  { icon: Calendar, title: "Gestion simplifiee", text: "Calendrier, tarifs et disponibilités depuis un seul espace." },
  { icon: Wallet, title: "Revenus suivis", text: "Visualisez vos gains et l'historique de vos réservations." },
  { icon: ShieldCheck, title: "Voyageurs vérifiés", text: "Des réservations payées et securisees par KoraStay." },
];

export default async function OwnerLandingPage() {
  const user = await getCurrentUser();
  const isOwner = user?.role === "OWNER" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              <Home className="h-3.5 w-3.5" /> Espace propriétaire
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Valorisez votre résidence avec KoraStay
            </h1>
            <p className="mt-4 max-w-lg text-muted">
              Rejoignez le réseau de résidences vérifiées et augmentez vos revenus
              en toute simplicité, partout en Côte d'Ivoire.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-soft">
              <BadgeCheck className="h-8 w-8 text-brand-600" />
              <p className="text-sm text-foreground">
                <span className="font-bold">Badge Résidence vérifiée</span> : rassurez les
                voyageurs et augmentez vos réservations.
              </p>
            </div>
          </div>

          <div className="rounded-4xl border border-border bg-surface p-6 shadow-card sm:p-8">
            {!user ? (
              // Visiteur sans compte : la demande EST la creation du compte proprietaire.
              <RegisterForm
                defaultType="OWNER"
                lockType
                title="Créer mon compte propriétaire"
                subtitle="Devenir propriétaire commence ici : créez votre compte, puis publiez vos logements."
              />
            ) : isOwner ? (
              // Deja proprietaire : acces direct a l'espace.
              <div className="py-4 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Home className="h-7 w-7" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground">Votre espace est prêt</h2>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                  Gérez vos résidences, votre calendrier et vos revenus depuis votre espace propriétaire.
                </p>
                <Button asChild size="lg" className="mt-5">
                  <Link href="/owner">Accéder à mon espace <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            ) : (
              // Compte existant (voyageur, etc.) : on active l'espace proprietaire.
              <div className="py-2">
                <h2 className="text-xl font-bold text-foreground">Activez votre espace propriétaire</h2>
                <p className="mb-5 mt-1.5 text-sm text-muted">
                  Bonjour {user.firstName}, votre compte deviendra un compte <strong>propriétaire</strong> :
                  vous pourrez publier vos logements et recevoir des réservations. Vous gardez le même identifiant.
                </p>
                <form action={becomeOwnerAction}>
                  <Button type="submit" size="lg" className="w-full">
                    Activer mon espace propriétaire <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
                <p className="mt-3 text-center text-xs text-muted">
                  Vous publierez vos biens ensuite ; chaque résidence est vérifiée avant mise en ligne.
                </p>
              </div>
            )}
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
