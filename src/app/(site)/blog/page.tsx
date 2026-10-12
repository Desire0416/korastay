import Link from "next/link";
import { Newspaper, ArrowUpRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/blog-queries";
import { SmartImage } from "@/components/ui/smart-image";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/public/page-hero";
import { formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.blog.metaTitle, description: dict.pages.blog.metaDescription, alternates: alternatesFor("/blog") };
}

export default async function BlogPage() {
  const [posts, { locale, dict }] = await Promise.all([getPublishedPosts(), getI18n()]);
  const t = dict.pages.blog;
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        accent={t.accent}
        description={
          <>
            <p>{t.subtitle}</p>
            {dict.pages.frOnly && <p className="mt-2 text-sm italic">{dict.pages.frOnly}</p>}
          </>
        }
      />

      <div className="container-page py-12 md:py-16">
        {!lead ? (
          <EmptyState icon={Newspaper} title={t.emptyTitle} description={t.emptyText} />
        ) : (
          <>
            {/* Article a la une */}
            <Link href={localePath(`/blog/${lead.slug}`, locale)} className="group grid grid-cols-1 items-center gap-8 md:grid-cols-[1.2fr_1fr]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem]">
                <SmartImage src={lead.coverImageUrl} alt={lead.title} seed={`blog-${lead.slug}`} priority sizes="(max-width: 768px) 100vw, 55vw" imgClassName="transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div>
                <p className="eyebrow text-[10.5px] text-terracotta">{formatDate(lead.publishedAt ?? lead.createdAt)}</p>
                <h2 className="mt-3 text-balance font-display text-[2rem] leading-[1.1] text-foreground transition-colors group-hover:text-terracotta md:text-[2.5rem]">
                  {lead.title}
                </h2>
                {lead.excerpt && <p className="mt-4 line-clamp-3 text-[15.5px] leading-relaxed text-muted">{lead.excerpt}</p>}
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="border-b border-ink/25 pb-0.5 group-hover:border-ink">{t.read}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 border-t border-border pt-14 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <Link key={p.id} href={localePath(`/blog/${p.slug}`, locale)} className="group block">
                    <div className={cn("relative aspect-[4/3] overflow-hidden", i % 3 === 1 ? "rounded-arch" : "rounded-[1.5rem]")}>
                      <SmartImage src={p.coverImageUrl} alt={p.title} seed={`blog-${p.slug}`} sizes="(max-width: 768px) 100vw, 33vw" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <p className="eyebrow mt-4 text-[10px] text-terracotta">{formatDate(p.publishedAt ?? p.createdAt)}</p>
                    <h3 className="mt-2 font-display text-[1.35rem] leading-snug text-foreground transition-colors group-hover:text-terracotta">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{p.excerpt}</p>}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
