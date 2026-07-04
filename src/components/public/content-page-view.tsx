import { notFound } from "next/navigation";
import { ScrollText, ChevronDown } from "lucide-react";
import { getContentPage } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

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
  const page = await getContentPage(slug);
  if (!page || !page.isPublished) notFound();

  const isHtml = /<(h2|h3|p|ul|ol|table)[\s>]/i.test(page.body);
  const { version, body } = isHtml ? extractVersion(page.body) : { version: null, body: page.body };
  const toc = isHtml ? buildToc(body) : [];

  return (
    <div className="container-page py-10 lg:py-14">
      {/* En-tete */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Document légal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {page.title}
        </h1>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted">
          {version && <span className="font-medium text-foreground/70">{version}</span>}
          {version && <span aria-hidden className="text-border">•</span>}
          <span>Dernière mise à jour : {formatDate(page.updatedAt)}</span>
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sommaire (sticky sur desktop) */}
        {toc.length > 1 && (
          <aside className="hidden lg:block">
            <nav className="sticky top-[calc(var(--header-h)+1.5rem)]" aria-label="Sommaire">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <ScrollText className="h-3.5 w-3.5" /> Sommaire
              </p>
              <ul className="mt-3 space-y-1 border-l border-border">
                {toc.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-muted transition-colors hover:border-brand-400 hover:text-foreground"
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
          {/* Sommaire repliable (mobile uniquement) */}
          {toc.length > 1 && (
            <details className="group mb-6 rounded-2xl border border-border bg-surface-soft/50 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-1.5">
                  <ScrollText className="h-4 w-4 text-brand-600" /> Sommaire
                </span>
                <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <nav aria-label="Sommaire" className="border-t border-border p-2">
                <ul className="space-y-0.5">
                  {toc.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                      >
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
              className="prose prose-sm sm:prose-base max-w-none scroll-mt-28 prose-headings:scroll-mt-28 prose-h2:mt-10 prose-h2:border-t prose-h2:border-border prose-h2:pt-8 prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:first:mt-0 prose-h2:first:border-0 prose-h2:first:pt-0 prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-border prose-th:px-4 prose-th:py-2.5 prose-td:px-4 prose-td:py-2.5 prose-li:marker:text-brand-400"
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
  );
}

export async function generateContentMetadata(slug: string) {
  const page = await getContentPage(slug);
  return {
    title: page?.seoTitle ?? page?.title ?? "KoraStay",
    description: page?.seoDescription ?? undefined,
  };
}
