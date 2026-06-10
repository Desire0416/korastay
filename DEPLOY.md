# Deploiement KoraStay sur Vercel + Neon (PostgreSQL)

Ce guide deploie l'application sur Vercel avec la base PostgreSQL Neon.

## 1. Base de donnees (deja faite)

La base Neon a ete provisionnee et remplie :
- Schema cree (`prisma db push`)
- Donnees de demonstration chargees (`npm run seed`)

Comptes de demo (mot de passe `Password123!`) :
- `admin@korastay.com` (Super Admin)
- `traveler@korastay.com` (Voyageur)
- `owner@korastay.com` (Proprietaire)
- `guide@korastay.com`, `transport@korastay.com`, `restaurant@korastay.com` (Partenaires)
- `business@korastay.com` (Business)

## 2. Importer le repo dans Vercel

1. Sur https://vercel.com -> **Add New... > Project**.
2. Choisir le depot GitHub `Desire0416/korastay`.
3. Framework : **Next.js** (detecte automatiquement). Ne rien changer au build.

## 3. Variables d'environnement Vercel

Dans **Project Settings > Environment Variables**, ajouter (Production + Preview) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL Neon **poolee** : `...-pooler...neon.tech/neondb?sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | URL Neon **directe** : `...neon.tech/neondb?sslmode=require` (sans `-pooler`) |
| `AUTH_SECRET` | une chaine aleatoire longue (>= 32 caracteres) |
| `NEXT_PUBLIC_APP_NAME` | `KoraStay` |
| `NEXT_PUBLIC_APP_URL` | l'URL Vercel finale (ex: `https://korastay.vercel.app`) |
| `APP_URL` | idem |
| `EMAIL_FROM` | `KoraStay <contact@korastay.com>` |
| `PAYMENT_PROVIDER` | `mock` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `contact@korastay.com` |
| `NEXT_PUBLIC_CONTACT_PHONE` | `+225 07 57 90 88 84` |
| `NEXT_PUBLIC_USE_REMOTE_IMAGES` | `true` (affiche les images de demo) |

> Les valeurs exactes de `DATABASE_URL` / `DIRECT_URL` sont dans le fichier `.env` local (non versionne).

## 4. Deployer

Cliquer **Deploy**. Le build execute `prisma generate && next build`.
La base etant deja provisionnee, l'app se connecte directement.

## 5. Limite connue : upload de fichiers

Le systeme de fichiers de Vercel est en lecture seule : l'upload local
(`/api/upload` -> `public/uploads`) renvoie une erreur propre (503).
Cela concerne : photo de profil, photos de residence, couverture de blog,
pieces jointes de messagerie. Tout le reste fonctionne.

Pour activer les uploads en production, brancher un stockage objet
(**Vercel Blob** ou **S3/Cloudinary**) dans `src/app/api/upload/route.ts`.

## Re-provisionner la base (si besoin)

```bash
# Avec .env pointant vers Neon :
npx prisma db push      # cree/maj le schema (via DIRECT_URL)
npm run seed            # recharge les donnees de demo
```
