import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailAction } from "@/server/actions/auth";
import { AuthStatusIcon } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.auth.verify.metaTitle, robots: { index: false } };
}

type SP = Record<string, string | string[] | undefined>;

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, { locale, dict }] = await Promise.all([searchParams, getI18n()]);
  const t = dict.auth.verify;
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  const result = token ? await verifyEmailAction(token) : { ok: false, error: dict.auth.messages.linkMissing };

  return (
    <div className="text-center">
      <AuthStatusIcon tone={result.ok ? "brand" : "danger"}>
        {result.ok ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
      </AuthStatusIcon>
      <h1 className="mt-7 font-display text-[2rem] font-normal leading-tight text-foreground">
        {result.ok ? t.okTitle : t.koTitle}
      </h1>
      <p className="mt-3 leading-relaxed text-muted">{result.ok ? t.okText : result.error}</p>
      <div className="mt-8 flex flex-col gap-3">
        {result.ok ? (
          <Button asChild size="lg"><Link href={localePath("/login", locale)}>{t.login}</Link></Button>
        ) : (
          <>
            <Button asChild size="lg"><Link href={localePath("/login", locale)}>{t.login}</Link></Button>
            <Button asChild variant="outline"><Link href={localePath("/", locale)}>{dict.auth.register.doneHome}</Link></Button>
          </>
        )}
      </div>
    </div>
  );
}
