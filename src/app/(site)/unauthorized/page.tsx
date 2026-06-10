import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export const metadata = { title: "Acces non autorise" };

export default function UnauthorizedPage() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-danger">
        <ShieldAlert className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-foreground">Acces non autorise</h1>
      <p className="mt-2 max-w-md text-muted">
        Vous n'avez pas les permissions necessaires pour acceder a cette page.
        Si vous pensez qu'il s'agit d'une erreur, contactez l'assistance.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild><Link href="/">Retour a l'accueil</Link></Button>
        <Button asChild variant="outline"><Link href="/contact">Contacter l'assistance</Link></Button>
      </div>
    </div>
  );
}
