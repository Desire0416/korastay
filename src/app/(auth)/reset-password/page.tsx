import Link from "next/link";
import { Link2Off } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthStatusIcon } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.auth.reset.metaTitle, robots: { index: false } };
}

type SP = Record<string, string | string[] | undefined>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, { locale, dict }] = await Promise.all([searchParams, getI18n()]);
  const t = dict.auth.reset;
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;

  if (!token) {
    return (
      <div className="text-center">
        <AuthStatusIcon tone="danger">
          <Link2Off className="h-7 w-7" />
        </AuthStatusIcon>
        <h1 className="mt-7 font-display text-[2rem] font-normal leading-tight text-foreground">{t.invalidTitle}</h1>
        <p className="mt-3 text-muted">{t.invalidText}</p>
        <Button asChild className="mt-8">
          <Link href={localePath("/forgot-password", locale)}>{t.newLink}</Link>
        </Button>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
