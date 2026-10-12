import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight, Languages } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog-queries";
import { SmartImage } from "@/components/ui/smart-image";
import { Ornament } from "@/components/brand/motif";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, { dict }] = await Promise.all([getPostBySlug(slug), getI18n()]);
  return {
    title: post?.title ?? dict.pages.blog.notFound,
    description: post?.excerpt ?? undefined,
    alternates: alternatesFor(`/blog/${slug}`),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.isPublished) notFound();
  const [related, { locale, dict }] = await Promise.all([getRelatedPosts(slug, 3), getI18n()]);
  const t = dict.pages.blog;
  const paragraphs = post.body.split(/\n\n+/);

  return (
    <article className="pb-10">
      <header className="container-page max-w-3xl pt-8 text-center md:pt-12">
        <Link href={localePath("/blog", locale)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> {t.back}
        </Link>
        <p className="eyebrow mt-8 flex items-center justify-center gap-3 text-[11px] text-terracotta">
          <Ornament side="left" />
          {formatDate(post.publishedAt ?? post.createdAt)}
          {post.author && <span className="text-muted">· {post.author.firstName} {post.author.lastName}</span>}
          <Ornament side="right" />
        </p>
        <h1 className="mt-5 text-balance font-display text-[2.3rem] font-normal leading-[1.08] tracking-[-0.02em] text-foreground md:text-display-md">
          {post.title}
        </h1>
        {dict.pages.frOnly && (
          <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-foreground/80 ring-1 ring-inset ring-sand-300/70">
            <Languages className="h-4 w-4 text-terracotta" /> {dict.pages.frOnly}
          </p>
        )}
      </header>

      <div className="container-page my-10 max-w-5xl">
        <div className="aspect-[16/8] overflow-hidden rounded-[2rem]">
          <SmartImage src={post.coverImageUrl} alt={post.title} seed={`blog-${post.slug}`} priority sizes="(max-width: 1024px) 100vw, 1000px" />
        </div>
      </div>

      <div className="container-page max-w-[42rem]">
        {post.excerpt && (
          <p className="mb-8 font-display text-[1.4rem] leading-relaxed text-foreground">{post.excerpt}</p>
        )}
        <div className="space-y-5 text-[17px] leading-[1.8] text-foreground/85">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <div className="container-page mt-20 max-w-5xl border-t border-border pt-14">
          <h2 className="mb-8 font-display text-[1.9rem] font-normal text-foreground">{t.related}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={localePath(`/blog/${r.slug}`, locale)} className="group block">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                  <SmartImage src={r.coverImageUrl} alt={r.title} seed={`blog-${r.slug}`} sizes="(max-width: 640px) 100vw, 33vw" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-display text-lg leading-snug text-foreground transition-colors group-hover:text-terracotta">{r.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  {t.readShort} <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
