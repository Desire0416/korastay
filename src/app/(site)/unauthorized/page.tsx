import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Motif } from "@/components/brand/motif";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.unauthorized.title, robots: { index: false } };
}

export default async function UnauthorizedPage() {
  const { locale, dict } = await getI18n();
  const t = dict.pages.unauthorized;
  return (
    <div className="grain relative overflow-hidden">
      <Motif variant="bogolan" fade="radial" className="text-sand-500/20" />
      <div className="container-page relative flex flex-col items-center justify-center py-28 text-center">
        <span className="flex h-20 w-16 items-center justify-center rounded-arch-sm bg-terracotta text-white shadow-card">
          <ShieldAlert className="h-7 w-7" strokeWidth={1.6} />
        </span>
        <h1 className="mt-8 font-display text-[2.4rem] font-normal leading-tight text-foreground">{t.title}</h1>
        <p className="mt-3 max-w-md leading-relaxed text-muted">{t.text}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link href={localePath("/", locale)}>{t.home}</Link></Button>
          <Button asChild variant="outline" size="lg"><Link href={localePath("/contact", locale)}>{t.support}</Link></Button>
        </div>
      </div>
    </div>
  );
}
