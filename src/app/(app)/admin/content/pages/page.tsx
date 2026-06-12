import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Contenu - Admin" };

export default async function AdminContentPagesPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const pages = await prisma.contentPage.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Pages de contenu" description="Editez les pages légales et institutionnelles." />
      <div className="space-y-3">
        {pages.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><FileText className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-foreground">{p.title}</p>
                <p className="text-xs text-muted">/{p.slug} - maj {formatDate(p.updatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={p.isPublished ? "success" : "neutral"}>{p.isPublished ? "Publiée" : "Brouillon"}</Badge>
              <Button asChild variant="outline" size="sm"><Link href={`/admin/content/pages/${p.id}`}><Pencil className="h-3.5 w-3.5" /> Editer</Link></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
