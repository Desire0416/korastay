import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { card } from "@/components/dashboard/styles";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.pages.metaTitle };
}

export default async function AdminContentPagesPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [pages, { locale, dict }] = await Promise.all([prisma.contentPage.findMany({ orderBy: { title: "asc" } }), getI18n()]);
  const t = dict.dashAdmin.system.pages;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <div className="space-y-3">
        {pages.map((p) => (
          <div key={p.id} className={`${card} flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5`}>
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-sand-100 text-terracotta">
                <FileText className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg leading-tight text-foreground">{p.title}</p>
                <p className="truncate text-xs text-muted">/{p.slug} · {t.updated.replace("{date}", formatDate(p.updatedAt, locale))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={p.isPublished ? "success" : "neutral"} size="sm">{p.isPublished ? t.published : t.draft}</Badge>
              <Button asChild variant="outline" size="sm">
                <Link href={localePath(`/admin/content/pages/${p.id}`, locale)}><Pencil className="h-3.5 w-3.5" /> {t.edit}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
