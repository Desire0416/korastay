import { notFound } from "next/navigation";
import { ScrollText, ChevronDown, Languages } from "lucide-react";
import { getContentPage } from "@/lib/queries";
import { Motif, Ornament } from "@/components/brand/motif";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";

// Extrait la ligne de version (prependue lors de l'import) pour l'afficher
// dans l'en-tete plutot que dans le corps.
function extractVersion(html: string): { version: string | null; body: string } {
  const m = html.match(/^<p class="doc-version"><em>([\s\S]*?)<\/em><\/p>/);
  if (!m) return { version: null, body: html };
  return { version: m[1].trim(), body: html.slice(m[0].length) };
}

// Construit le sommaire a partir des <h2 id="...">Titre</h2>.
function buildToc(html: string): { id: string; text: string }[] {
  const toc: { id: string; text: string }[] = [];
  const re = /<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    toc.push({ id: m[1], text: m[2].replace(/<[^>]+>/g, "").trim() });
  }
  return toc;
}

export async function ContentPageView({ slug }: { slug: string }) {
  const [page, { dict }] = await Promise.all([getContentPage(slug), getI18n()]);
  if (!page || !page.isPublished) notFound();
  const t = dict.pages.legal;

  const isHtml = /<(h2|h3|p|ul|ol|table)[\s>]/i.test(page.body);
  const { version, body } = isHtml ? extractVersion(page.body) : { version: null, body: page.body };
  const toc = isHtml ? buildToc(body) : [];

  return (
    <>
      {/* En-tete */}
      <header className="grain relative overflow-hidden border-b border-border/70">
        <Motif variant="bogolan" fade="bottom" className="text-sand-500/[0.14]" />
        <div className="container-page relative py-12 text-center md:py-16">
          <p className="eyebrow flex items-center justify-center gap-3 text-terracotta">
            <Ornament side="left" />
            {t.eyebrow}
            <Ornament side="right" />
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-[2.3rem] font-normal leading-[1.06] tracking-[-0.02em] text-foreground md:text-display-md">
            {page.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted">
            {version && <span className="font-medium text-foreground/70">{version}</span>}
            {version && <span aria-hidden className="text-sand-400">◆</span>}
            <span>{t.updated.replace("{date}", formatDate(page.updatedAt))}</span>
          </p>
          {dict.pages.frOnly && (
            <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-foreground/80 ring-1 ring-inset ring-sand-300/70">
              <Languages className="h-4 w-4 text-terracotta" /> {dict.pages.frOnly}
            </p>
          )}
        </div>
      </header>

      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Sommaire (sticky sur desktop) */}
          {toc.length > 1 && (
            <aside className="hidden lg:block">
              <nav className="sticky top-[calc(var(--header-h)+1.5rem)]" aria-label={t.toc}>
                <p className="eyebrow flex items-center gap-1.5 text-[10.5px] text-muted">
                  <ScrollText className="h-3.5 w-3.5 text-terracotta" /> {t.toc}
                </p>
                <ul className="mt-4 space-y-0.5 border-l border-sand-300">
                  {toc.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted transition-colors hover:border-terracotta hover:text-ink"
                      >
                        {s.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}

          {/* Corps du document */}
          <article className="min-w-0">
            {toc.length > 1 && (
              <details className="group mb-8 rounded-[1.25rem] border border-border bg-surface lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-terracotta" /> {t.toc}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <nav aria-label={t.toc} className="border-t border-border p-2">
                  <ul className="space-y-0.5">
                    {toc.map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`} className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-sand-50 hover:text-ink">
                          {s.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </details>
            )}

            {isHtml ? (
              <div
                className="prose prose-sm max-w-none scroll-mt-28 sm:prose-base prose-headings:scroll-mt-28 prose-headings:font-normal prose-h2:mt-12 prose-h2:border-t prose-h2:border-border prose-h2:pt-10 prose-h2:text-[1.6rem] prose-h2:first:mt-0 prose-h2:first:border-0 prose-h2:first:pt-0 prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-border prose-th:px-4 prose-th:py-2.5 prose-td:px-4 prose-td:py-2.5 prose-li:marker:text-terracotta"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              // Repli : ancien contenu texte brut (paragraphes separes par ligne vide).
              <div className="space-y-4 leading-relaxed text-foreground/90">
                {body.split(/\n\n+/).map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}

export async function generateContentMetadata(slug: string) {
  const page = await getContentPage(slug);
  return {
    title: page?.seoTitle ?? page?.title ?? "KoraStay",
    description: page?.seoDescription ?? undefined,
  };
}
