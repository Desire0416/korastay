import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { PasswordForm } from "@/components/dashboard/password-form";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.security.metaTitle };
}

export default async function SecurityPage() {
  await requireUser();
  const { dict } = await getI18n();
  const t = dict.dashAccount.security;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <div className="rounded-[1.5rem] border border-border/80 bg-surface p-6 shadow-soft sm:p-8">
        <h2 className="mb-1 flex items-center gap-2.5 font-display text-xl text-foreground">
          <ShieldCheck className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.passwordTitle}
        </h2>
        <p className="mb-6 text-sm text-muted">{t.passwordText}</p>
        <PasswordForm />
      </div>
    </div>
  );
}
