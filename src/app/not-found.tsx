import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <Logo href="/" />
      <p className="mt-10 font-display text-7xl font-semibold text-brand-500">404</p>
      <h1 className="mt-3 text-2xl font-bold text-foreground">
        Cette page n'est pas encore disponible
      </h1>
      <p className="mt-2 max-w-md text-muted">
        Le lien que vous avez suivi est introuvable ou la page est en construction.
        Reprenons votre voyage depuis le debut.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/"><Home className="h-4 w-4" /> Retour a l'accueil</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/residences"><Compass className="h-4 w-4" /> Explorer les résidences</Link>
        </Button>
      </div>
    </div>
  );
}
