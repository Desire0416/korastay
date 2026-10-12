import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ContentPageForm } from "@/components/dashboard/content-page-form";
import { Button } from "@/components/ui/button";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.pages.editMeta };
}

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [page, { locale, dict }] = await Promise.all([prisma.contentPage.findUnique({ where: { id } }), getI18n()]);
  if (!page) notFound();
  const t = dict.dashAdmin.system.pages;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={localePath("/admin/content/pages", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader
        title={page.title}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={localePath(`/${page.slug}`, locale)} target="_blank"><ExternalLink className="h-4 w-4" /> {t.view}</Link>
          </Button>
        }
      />
      <div className={`${card} p-6 sm:p-8`}>
        <ContentPageForm id={page.id} title={page.title} body={page.body} />
      </div>
    </div>
  );
}
