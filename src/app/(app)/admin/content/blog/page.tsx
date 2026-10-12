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
import { card } from "@/components/dashboard/styles";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.blog.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const [posts, { locale, dict }] = await Promise.all([getAllPostsAdmin(), getI18n()]);
  const t = dict.dashAdmin.system.blog;
  const newHref = localePath("/admin/content/blog/new", locale);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={<Button asChild variant="terracotta"><Link href={newHref}><Plus className="h-4 w-4" /> {t.add}</Link></Button>}
      />
      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> {t.created}
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title={t.emptyTitle} description={t.emptyText} action={<Button asChild><Link href={newHref}>{t.add}</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className={`${card} flex flex-wrap items-center gap-4 p-4`}>
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-arch-sm">
                <SmartImage src={p.coverImageUrl} alt={p.title} seed={`blog-${p.slug}`} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg leading-tight text-foreground">{p.title}</h3>
                  <Badge tone={p.isPublished ? "success" : "neutral"} size="sm">{p.isPublished ? t.published : t.draft}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {t.updated.replace("{date}", formatDate(p.updatedAt, locale))}
                  {p.author ? ` · ${p.author.firstName} ${p.author.lastName}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {p.isPublished && (
                  <Link href={localePath(`/blog/${p.slug}`, locale)} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand-50 hover:text-ink">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link href={localePath(`/admin/content/blog/${p.id}/edit`, locale)}><Pencil className="h-3.5 w-3.5" /> {t.edit}</Link>
                </Button>
                <AdminActions actions={[{ label: p.isPublished ? t.unpublish : t.publish, fn: toggleBlogPublish.bind(null, p.id), variant: p.isPublished ? "ghost" : "soft" }]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
