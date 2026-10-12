import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getPostById } from "@/lib/blog-queries";
import { deleteBlogPost } from "@/server/actions/blog";
import { PageHeader } from "@/components/dashboard/page-header";
import { BlogPostForm } from "@/components/dashboard/blog-post-form";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Button } from "@/components/ui/button";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.blog.editMeta };
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [post, { locale, dict }] = await Promise.all([getPostById(id), getI18n()]);
  if (!post) notFound();
  const t = dict.dashAdmin.system.blog;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/content/blog", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader
        title={t.editTitle}
        description={post.title}
        actions={
          <>
            {post.isPublished && (
              <Button asChild variant="outline" size="sm">
                <Link href={localePath(`/blog/${post.slug}`, locale)} target="_blank"><ExternalLink className="h-4 w-4" /> {t.view}</Link>
              </Button>
            )}
            <AdminActions
              actions={[{ label: t.delete, icon: "Trash2", fn: deleteBlogPost.bind(null, post.id), variant: "ghost", confirm: t.confirmDelete, redirectTo: "/admin/content/blog" }]}
            />
          </>
        }
      />
      <div className={`${card} p-6 sm:p-8`}>
        <BlogPostForm
          id={post.id}
          defaults={{
            title: post.title,
            excerpt: post.excerpt ?? "",
            body: post.body,
            coverImageUrl: post.coverImageUrl ?? "",
            isPublished: post.isPublished,
          }}
        />
      </div>
    </div>
  );
}
