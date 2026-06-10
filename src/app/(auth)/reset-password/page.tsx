import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Reinitialiser le mot de passe" };

type SP = Record<string, string | string[] | undefined>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Lien invalide</h1>
        <p className="mt-2 text-muted">Ce lien de reinitialisation est incomplet ou expire.</p>
        <Button asChild className="mt-6"><Link href="/forgot-password">Demander un nouveau lien</Link></Button>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
