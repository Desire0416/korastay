import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ContentPageForm } from "@/components/dashboard/content-page-form";

export const metadata = { title: "Editer la page" };

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const page = await prisma.contentPage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/content/pages" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Pages de contenu
      </Link>
      <PageHeader
        title={page.title}
        actions={<Link href={`/${page.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600"><ExternalLink className="h-4 w-4" /> Voir</Link>}
      />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <ContentPageForm id={page.id} title={page.title} body={page.body} />
      </div>
    </div>
  );
}
