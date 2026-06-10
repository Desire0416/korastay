import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { BlogPostForm } from "@/components/dashboard/blog-post-form";

export const metadata = { title: "Nouvel article - Admin" };

export default async function NewBlogPostPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/content/blog" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Blog
      </Link>
      <PageHeader title="Nouvel article" description="Redigez un article de blog." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <BlogPostForm />
      </div>
    </div>
  );
}
