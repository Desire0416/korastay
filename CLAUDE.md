# KoraStay — Claude Code Project Context

## Stack
- **Framework** : Next.js 15.5 App Router, React 19, TypeScript strict
- **DB** : Prisma 6.19 + Neon PostgreSQL (pooled via pgbouncer)
- **Styling** : Tailwind CSS + `@tailwindcss/typography` (prose KoraStay), `tailwindcss-animate`
- **Auth** : Sessions custom (iron-session-like), email confirmation obligatoire avant login
- **Email** : Resend (domaine vérifié `korastay.net`)
- **Upload** : Vercel Blob (prod) / local (dev)
- **Paiement** : mode manuel (validation admin), pas d'API de paiement en ligne pour l'instant
- **Maps** : Leaflet + react-leaflet v5 (client-only, dynamic import)
- **Images** : `next/image` avec AVIF/WebP, composant `SmartImage` avec fallback
- **Cron** : `/api/cron` quotidien à 03:00 UTC (Vercel Cron), sécurisé par `CRON_SECRET`

## Domain & Production
- **URL** : https://www.korastay.net
- **Hébergement** : Vercel
- **Repo GitHub** : https://github.com/Desire0416/korastay.git
- **DB** : Neon PostgreSQL (base partagée dev/prod via DATABASE_URL)

## Branches
- `main` : production, déployée automatiquement sur Vercel
- `i18n-en` : traduction anglaise (chantier #14, EN COURS)

## Architecture i18n (#14 — EN COURS)
- Routage par URL : `/en/...` (middleware rewrite), FR = défaut sans préfixe
- `src/middleware.ts` : détecte `/en`, réécrit en interne, pose `x-locale` + `x-pathname`
- `src/lib/i18n.ts` : dictionnaire FR/EN (`Dictionary`), helpers `localePath()`, `switchLocalePath()`
- `src/lib/i18n.server.ts` : `getLocale()` + `getI18n()` côté serveur
- `src/components/i18n/provider.tsx` : `I18nProvider` + hooks `useI18n()`/`useLocale()` côté client
- Pattern serveur : `const { dict, locale } = await getI18n()` → passer aux composants
- Pattern client : `"use client"` + `const { dict, locale } = useI18n()` (dégrade en FR hors provider)
- **Pages traduites** : home (desktop+mobile), liste résidences, fiche résidence, checkout résidence, packs (liste+fiche)
- **Pages restantes** : activités, destinations, blog, pages statiques (about, faq, contact), auth, dashboards (account/owner/partner/admin), enums `*Meta`, messages d'erreur

## Paiement manuel
- `src/lib/payment-rules.ts` : engine de règles (frais de service, caution)
- `src/lib/reservation-finalize.ts` : finalisation — gardé HORS `"use server"` volontairement
- Admin : `/admin/settings/payments` (réglages), `/admin/payouts` (reversements)
- Voyageur : `ManualPaymentPanel` (instructions + déclaration avec capture)
- Caution : statuts NONE/REQUIRED/HELD/RELEASED/RETAINED (pas de split partiel/total)

## Performance (déjà optimisé)
- `getCurrentUser` wrappé dans `React.cache()` (déduplique par requête)
- Requêtes publiques chaudes (`getFeatured*`, `getPacks`, etc.) wrappées dans `unstable_cache`
- N+1 messagerie éliminé (`$queryRaw` avec JOIN groupé)
- `loading.tsx` skeletons sur 8 routes
- Transitions optimistes (`useTransition`) sur filtres, recherche, réservation
- Pool DB : `connection_limit=10&pool_timeout=20&connect_timeout=10` obligatoire dans DATABASE_URL

## Pages légales
- 6 pages : confidentialite, politique-annulation, mentions-legales, conditions-partenaires, conditions-generales, charte-qualite
- Rendu HTML riche avec `ContentPageView` (prose + sommaire sticky desktop + sommaire repliable mobile)
- Source HTML dans `content/legal/<slug>.html`, import via `npx tsx scripts/import-content-pages.ts`
- Valeurs provisoires à affiner via `/admin/content/pages`

## Sécurité — RÈGLES ABSOLUES
- `.env` est gitignored — JAMAIS commiter
- Toujours grep les secrets avant `git push`
- Cron fail-closed en prod : renvoie 503 si `CRON_SECRET` absent
- `finalizeReservationPayment` JAMAIS dans un fichier `"use server"`

## Commandes utiles
```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npx prisma studio    # Explorer la DB
npx prisma db push   # Appliquer le schéma à la DB
npx tsx scripts/import-content-pages.ts  # Importer les pages légales dans la DB
npx tsx scripts/fix-accents.ts           # Restaurer les accents (idempotent)
```
