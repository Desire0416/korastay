import Link from "next/link";
import { Newspaper, ArrowRight, Calendar } from "lucide-react";
import { getPublishedPosts } from "@/lib/blog-queries";
import { SmartImage } from "@/components/ui/smart-image";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Blog",
  description: "Conseils de voyage, decouvertes et inspirations pour vos sejours en Afrique de l'Ouest avec KoraStay.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-12 text-center md:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            <Newspaper className="h-3.5 w-3.5" /> Le blog KoraStay
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Inspirations & conseils de voyage
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Decouvertes, bons plans et recits pour explorer l'Afrique de l'Ouest autrement.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        {posts.length === 0 ? (
          <EmptyState icon={Newspaper} title="Aucun article" description="Les premiers articles arrivent bientot." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition-shadow hover:shadow-card-hover">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SmartImage src={p.coverImageUrl} alt={p.title} seed={`blog-${p.slug}`} imgClassName="transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="flex items-center gap-1 text-xs text-muted"><Calendar className="h-3.5 w-3.5" /> {formatDate(p.publishedAt ?? p.createdAt)}</p>
                  <h2 className="mt-1 text-lg font-bold leading-tight text-foreground">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    Lire l'article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
