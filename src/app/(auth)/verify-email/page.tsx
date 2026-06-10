import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Verification de l'email" };

type SP = Record<string, string | string[] | undefined>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  const result = token ? await verifyEmailAction(token) : { ok: false, error: "Lien manquant." };

  return (
    <div className="text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl ${
          result.ok ? "bg-emerald-50 text-success" : "bg-red-50 text-danger"
        }`}
      >
        {result.ok ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
      </div>
      <h1 className="mt-5 text-2xl font-bold text-foreground">
        {result.ok ? "Email confirme !" : "Verification impossible"}
      </h1>
      <p className="mt-2 text-muted">
        {result.ok
          ? "Votre adresse email a ete confirmee avec succes. Vous pouvez profiter pleinement de KoraStay."
          : result.error}
      </p>
      <div className="mt-7 flex flex-col gap-3">
        <Button asChild size="lg"><Link href="/account">Acceder a mon espace</Link></Button>
        {!result.ok && (
          <Button asChild variant="outline"><Link href="/login">Se connecter</Link></Button>
        )}
      </div>
    </div>
  );
}
