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

export const metadata = { title: "Editer l'article - Admin" };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/content/blog" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Blog
      </Link>
      <PageHeader
        title="Editer l'article"
        description={post.title}
        actions={
          <div className="flex items-center gap-2">
            {post.isPublished && (
              <Button asChild variant="outline" size="sm"><Link href={`/blog/${post.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /> Voir</Link></Button>
            )}
            <AdminActions actions={[{ label: "Supprimer", icon: "Trash2", fn: deleteBlogPost.bind(null, post.id), variant: "ghost", confirm: "Supprimer cet article ?", redirectTo: "/admin/content/blog" }]} />
          </div>
        }
      />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
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
