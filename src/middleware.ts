import { NextResponse, type NextRequest } from "next/server";

// ============================================================
// Routage i18n par URL — locale par defaut cachee.
//   FR  -> sans prefixe   (/residences)
//   EN  -> prefixe /en    (/en/residences) reecrit en interne vers /residences
// La locale + le chemin d'origine sont injectes dans des en-tetes
// de requete (x-locale / x-pathname) lus cote serveur (i18n.server.ts).
// ============================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const locale = isEn ? "en" : "fr";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-pathname", pathname);

  if (isEn) {
    const stripped = pathname === "/en" ? "/" : pathname.slice(3);
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // S'execute sur tout sauf les internes Next, l'API et les fichiers (avec extension).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
