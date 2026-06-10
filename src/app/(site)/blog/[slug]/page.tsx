import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, ChevronLeft, ArrowRight } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog-queries";
import { SmartImage } from "@/components/ui/smart-image";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Article", description: post?.excerpt ?? undefined };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.isPublished) notFound();
  const related = await getRelatedPosts(slug, 3);
  const paragraphs = post.body.split(/\n\n+/);

  return (
    <article className="pb-10">
      <div className="container-page max-w-3xl pt-6">
        <Link href="/blog" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Tous les articles
        </Link>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(post.publishedAt ?? post.createdAt)}</span>
          {post.author && <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author.firstName} {post.author.lastName}</span>}
        </div>
      </div>

      <div className="container-page my-7 max-w-4xl">
        <div className="aspect-[16/8] overflow-hidden rounded-4xl">
          <SmartImage src={post.coverImageUrl} alt={post.title} seed={`blog-${post.slug}`} priority />
        </div>
      </div>

      <div className="container-page max-w-3xl">
        {post.excerpt && <p className="mb-6 text-lg font-medium leading-relaxed text-foreground/90">{post.excerpt}</p>}
        <div className="space-y-4 leading-relaxed text-foreground/90">
          {paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
        </div>
      </div>

      {related.length > 0 && (
        <div className="container-page mt-12 max-w-5xl border-t border-border pt-10">
          <h2 className="mb-5 font-display text-2xl font-semibold text-foreground">A lire aussi</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
                <div className="aspect-[16/10] overflow-hidden"><SmartImage src={r.coverImageUrl} alt={r.title} seed={`blog-${r.slug}`} /></div>
                <div className="p-4">
                  <h3 className="font-bold leading-tight text-foreground">{r.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Lire <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
