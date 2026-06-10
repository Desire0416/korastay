import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { PasswordForm } from "@/components/dashboard/password-form";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Securite" };

export default async function SecurityPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Securite" description="Protegez votre compte." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-foreground">
          <ShieldCheck className="h-5 w-5 text-brand-600" /> Mot de passe
        </h2>
        <p className="mb-5 text-sm text-muted">Choisissez un mot de passe fort et unique.</p>
        <PasswordForm />
      </div>
    </div>
  );
}
