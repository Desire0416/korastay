import Link from "next/link";
import { Plus, Pencil, Newspaper, CheckCircle2, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAllPostsAdmin } from "@/lib/blog-queries";
import { toggleBlogPublish } from "@/server/actions/blog";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Blog - Admin" };

type SP = Record<string, string | string[] | undefined>;

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const posts = await getAllPostsAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Blog"
        description="Redigez et publiez des articles."
        actions={<Button asChild><Link href="/admin/content/blog/new"><Plus className="h-4 w-4" /> Nouvel article</Link></Button>}
      />
      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-emerald-50 p-4 text-sm text-success">
          <CheckCircle2 className="h-5 w-5" /> Article cree.
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="Aucun article" description="Creez votre premier article de blog." action={<Button asChild><Link href="/admin/content/blog/new">Nouvel article</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-2xl"><SmartImage src={p.coverImageUrl} alt={p.title} seed={`blog-${p.slug}`} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{p.title}</h3>
                  <Badge tone={p.isPublished ? "success" : "neutral"}>{p.isPublished ? "Publie" : "Brouillon"}</Badge>
                </div>
                <p className="text-xs text-muted">maj {formatDate(p.updatedAt)}{p.author ? ` · ${p.author.firstName} ${p.author.lastName}` : ""}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {p.isPublished && <Link href={`/blog/${p.slug}`} target="_blank" className="text-muted hover:text-brand-600"><ExternalLink className="h-4 w-4" /></Link>}
                <Button asChild variant="outline" size="sm"><Link href={`/admin/content/blog/${p.id}/edit`}><Pencil className="h-3.5 w-3.5" /> Editer</Link></Button>
                <AdminActions actions={[{ label: p.isPublished ? "Depublier" : "Publier", fn: toggleBlogPublish.bind(null, p.id), variant: p.isPublished ? "ghost" : "soft" }]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
