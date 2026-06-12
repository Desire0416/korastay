import { notFound } from "next/navigation";
import { getContentPage } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export async function ContentPageView({ slug }: { slug: string }) {
  const page = await getContentPage(slug);
  if (!page || !page.isPublished) notFound();

  const paragraphs = page.body.split(/\n\n+/);

  return (
    <article className="container-page max-w-3xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Document légal</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-2 text-sm text-muted">Dernière mise a jour : {formatDate(page.updatedAt)}</p>

      <div className="mt-8 space-y-4 leading-relaxed text-foreground/90">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
    </article>
  );
}

export async function generateContentMetadata(slug: string) {
  const page = await getContentPage(slug);
  return {
    title: page?.seoTitle ?? page?.title ?? "KoraStay",
    description: page?.seoDescription ?? undefined,
  };
}
