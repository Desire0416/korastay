# KoraStay

> **KoraStay** est une plateforme ouest-africaine de réservation de résidences meublées vérifiées, de packs touristiques accompagnés et d'hébergements business. Elle connecte voyageurs, propriétaires, partenaires locaux et entreprises autour d'une expérience fiable, mobile-first, moderne et sécurisée.

**Slogan :** _Réservez votre séjour, vivez l'Afrique de l'Ouest._

Le MVP comprend : catalogue, recherche, réservation, paiement (mock), espaces voyageur / propriétaire / partenaire / business et back-office administrateur complet.

---

## ✨ Stack technique

| Domaine | Choix |
|---|---|
| Framework | **Next.js 15** (App Router, React 19, Server Actions) |
| Langage | **TypeScript** strict |
| Style | **Tailwind CSS 3** + design system maison |
| Composants | Primitives maison sur **Radix UI** (accessibilité) + **vaul** (bottom sheets) |
| Animations | **Framer Motion** (sobres) + transitions CSS |
| Base de données | **SQLite** via **Prisma** (dev) — portable PostgreSQL/Neon |
| Auth | Maison : sessions en base, cookie httpOnly, **bcrypt** |
| Validation | **Zod** |
| Icônes | **lucide-react** |
| Email | Abstraction (console en dev, **Resend** si clé fournie) |
| Paiement | Abstraction `PaymentProvider` (mock par défaut) |

> **Pourquoi SQLite ?** Zéro configuration, l'application démarre instantanément. Les montants sont stockés en entiers (le F CFA / XOF n'a pas de sous-unité décimale), ce qui rend la migration vers PostgreSQL directe (voir plus bas).

---

## 🚀 Démarrage rapide

Prérequis : **Node.js 20+** (testé sur Node 24).

```bash
# 1. Installer les dépendances
npm install

# 2. Générer le client Prisma + créer la base SQLite + données de démo
npm run db:setup
#    (équivaut à : npx prisma db push --force-reset && npm run seed)

# 3. Lancer le serveur de développement
npm run dev
#    → http://localhost:3000

# Build de production
npm run build
npm start
```

### Scripts disponibles

| Script | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (génère Prisma + Next) |
| `npm start` | Serveur de production |
| `npm run seed` | Peuple la base de données |
| `npm run db:setup` | Réinitialise la base + seed |
| `npm run db:push` | Synchronise le schéma Prisma |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | Lint |

---

## 👤 Comptes de démonstration

Mot de passe commun : **`Password123!`**

| Email | Rôle | Espace |
|---|---|---|
| `admin@korastay.com` | Super Admin | `/admin` |
| `traveler@korastay.com` | Voyageur | `/account` |
| `owner@korastay.com` | Propriétaire | `/owner` |
| `guide@korastay.com` | Partenaire (Guide) | `/partner` |
| `business@korastay.com` | Business | `/business/dashboard` |

---

## 🧭 Parcours principaux à tester

1. **Public** : accueil → recherche Daloa → fiche résidence → galerie → réserver.
2. **Voyageur** : inscription / connexion → réservation (paiement mock) → bon de réservation → favoris → annulation → avis après séjour.
3. **Propriétaire** : ajouter une résidence → photos → bloquer des dates → suivre revenus.
4. **Admin** : valider une résidence (attribuer un niveau) → gérer réservations / paiements / partenaires / demandes business → modérer avis → journal d'audit.
5. **Partenaire** : compléter le profil → créer des services → accepter/refuser des missions.
6. **Business** : soumettre une demande → suivre son statut → factures.

---

## 📱 Expériences distinctes mobile & desktop

L'expérience mobile **n'est pas une réduction du desktop** :

- **Mobile** (< 768px) : header compact, barre de recherche en pill + **bottom sheet** (façon Airbnb), **bottom navigation** fixe (Explorer / Packs / Favoris / Séjours / Profil), cartes verticales, carrousels d'images avec pagination, **CTA de réservation sticky**, calendrier et filtres en bottom sheet, formulaires aérés.
- **Desktop** (≥ 1024px) : header horizontal premium, hero large avec recherche segmentée, grilles de cartes, fiche résidence avec galerie mosaïque + **colonne de réservation sticky**, dashboards avec **sidebar collapsible**, tableaux lisibles.

---

## 🎨 Charte graphique

Couleurs issues de la charte KoraStay (concept « Route & Repère ») :

```
Vert (primaire)   #0F6B4F
Orange (accent)   #F2A23A
Teal foncé (ink)  #12343B
Crème (fond)      #F8F5EF
```

Typographies : **Plus Jakarta Sans** (UI/texte) + **Fraunces** (titres display).

---

## 🖼️ Images

Par défaut, l'application affiche des **placeholders illustrés locaux** (dégradés de marque, instantanés, sans réseau) — idéal pour une démo fiable et rapide, y compris hors-ligne.

- Les **photos uploadées localement** (propriétaire → photos) s'affichent toujours (`/uploads/...`).
- Pour activer des **images distantes** (ex. les URLs Picsum du seed), ajoutez dans `.env` :
  ```env
  NEXT_PUBLIC_USE_REMOTE_IMAGES="true"
  ```

---

## 💳 Paiement (mode démonstration)

Le provider de paiement est **`mock`** par défaut : les paiements sont **simulés** et confirmés immédiatement (aucune transaction réelle). Une bannière l'indique clairement côté checkout et côté admin.

L'architecture `PaymentProvider` (`src/lib/payments.ts`) permet de brancher Orange Money, Wave, MTN MoMo ou carte bancaire sans refactor :

```env
PAYMENT_PROVIDER="mock"   # mock | manual | orange_money | wave | mtn_momo | card
```

---

## 🗂️ Structure du projet

```
src/
  app/
    (site)/         Pages publiques (accueil, résidences, packs, destinations, business, légal…)
    (auth)/         Connexion, inscription, vérif email, reset mot de passe
    (app)/
      account/      Espace voyageur
      owner/        Espace propriétaire
      partner/      Espace partenaire
      business/     Espace business
      admin/        Back-office administrateur
    api/upload/     Upload d'images local
  components/
    ui/             Primitives (button, card, calendar, drawer, sheet, popover…)
    public/         Composants publics (cartes, recherche, galerie, widget réservation…)
    dashboard/      Composants des espaces connectés (shell, KPI, tables, formulaires…)
    auth/ brand/    Formulaires d'auth, logo
  lib/              Logique métier (prisma, auth, pricing, enums, queries, payments, email…)
  server/actions/   Server Actions (auth, réservations, owner, admin, partner, business, leads)
prisma/
  schema.prisma     30 modèles
  seed.ts           Données de démonstration réalistes
```

---

## 🔐 Sécurité

- Mots de passe hachés (**bcrypt**), sessions en base révocables.
- Contrôle d'accès **par rôle côté serveur** (`requireUser`, `requireRole`).
- Validation serveur systématique (**Zod**).
- Anti-double réservation : transaction + vérification de chevauchement avant paiement.
- Tokens email / reset **expirables et à usage unique**.
- Upload sécurisé : type MIME, taille, extension, nom aléatoire.
- Journal d'audit des actions sensibles (`/admin/audit`).

---

## 🐘 Passer à PostgreSQL / Neon

1. Dans `prisma/schema.prisma`, remplacer :
   ```prisma
   datasource db { provider = "sqlite" }
   ```
   par :
   ```prisma
   datasource db { provider = "postgresql" }
   ```
2. Mettre à jour `DATABASE_URL` dans `.env` :
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```
3. (Optionnel mais recommandé) convertir les champs de statut `String` en **enums natifs** — les valeurs sont déjà centralisées dans `src/lib/enums.ts`.
4. `npx prisma migrate dev` puis `npm run seed`.

Les montants étant déjà des entiers, aucune adaptation monétaire n'est nécessaire.

---

## 📍 Marchés

Phase pilote : **Daloa** (Haut-Sassandra) avec **Lux Résidence** comme résidence fondatrice.
Extension : Man, Yamoussoukro, San-Pédro, Korhogo, Bouaké, Grand-Bassam, Assinie, Abidjan.

---

## 📞 Contact de référence

- Email : `contact@korastay.com`
- Téléphone : `+225 07 57 90 88 84`

Variables configurables via `.env` (`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`).

---

_Conçu en Côte d'Ivoire pour l'Afrique de l'Ouest._ 🌍
