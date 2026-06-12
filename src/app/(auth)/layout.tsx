import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ShieldCheck, Star, MapPinned } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      {/* Panneau marque (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden gradient-brand p-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <Logo variant="light" />
        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Réservez votre séjour,<br />vivez l'Afrique de l'Ouest.
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Des résidences vérifiées, des packs touristiques accompagnes et des
            partenaires locaux de confiance.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: ShieldCheck, text: "Résidences contrôlées par KoraStay" },
              { icon: Star, text: "Avis vérifiés de voyageurs reels" },
              { icon: MapPinned, text: "Assistance locale a chaque étape" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <f.icon className="h-5 w-5" />
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/60">
          &copy; {new Date().getFullYear()} KoraStay
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link href="/" className="text-sm font-semibold text-muted hover:text-foreground">
            Retour au site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
