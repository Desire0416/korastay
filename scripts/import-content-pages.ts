/* eslint-disable no-console */
// ============================================================
// Import des pages de contenu legales dans la table ContentPage.
// Source : content/legal/<slug>.html (convertis depuis les .docx officiels).
// Lancer : npx tsx scripts/import-content-pages.ts
//
// Idempotent : upsert par slug. Met le contenu en ligne (isPublished = true).
// ATTENTION : ecrit dans la base pointee par DATABASE_URL (partagee avec la prod).
// A executer APRES le deploiement du nouveau rendu (ContentPageView markdown/HTML).
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

// Charge DATABASE_URL depuis .env (tsx ne le fait pas automatiquement).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^(\w+)=(?:"([^"]*)"|(.*))$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2] ?? m[3];
}

const prisma = new PrismaClient();

// slug -> { titre, description SEO }
const PAGES: { slug: string; title: string; seoDescription: string }[] = [
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    seoDescription:
      "Comment KoraStay collecte, utilise et protège vos données personnelles, et les droits dont vous disposez (loi ivoirienne n°2013-450).",
  },
  {
    slug: "politique-annulation",
    title: "Politique d'annulation et de remboursement",
    seoDescription:
      "Conditions d'annulation et barèmes de remboursement des réservations de résidences et de packs sur KoraStay.",
  },
  {
    slug: "mentions-legales",
    title: "Mentions légales",
    seoDescription:
      "Informations légales relatives à la plateforme KoraStay : éditeur, hébergement, propriété intellectuelle et responsabilité.",
  },
  {
    slug: "conditions-partenaires",
    title: "Conditions partenaires",
    seoDescription:
      "Engagements et obligations des propriétaires et partenaires (guides, transporteurs, restaurateurs) référencés sur KoraStay.",
  },
  {
    slug: "conditions-generales",
    title: "Conditions générales de réservation",
    seoDescription:
      "Les conditions générales qui régissent l'utilisation de KoraStay et les réservations effectuées via la plateforme.",
  },
  {
    slug: "charte-qualite",
    title: "Charte qualité KoraStay",
    seoDescription:
      "Les standards de vérification KoraStay : propreté, sécurité, équipement et conformité des résidences, et les trois niveaux de qualité.",
  },
];

async function main() {
  const dir = path.join(root, "content", "legal");
  for (const { slug, title, seoDescription } of PAGES) {
    const file = path.join(dir, `${slug}.html`);
    if (!fs.existsSync(file)) {
      console.warn(`⚠ ${slug} : fichier manquant (${file}) — ignoré.`);
      continue;
    }
    const body = fs.readFileSync(file, "utf8").trim();
    const data = { title, body, seoTitle: `${title} — KoraStay`, seoDescription, isPublished: true };
    await prisma.contentPage.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
    const todos = (body.match(/content-todo/g) || []).length;
    console.log(`✓ ${slug.padEnd(24)} ${body.length.toString().padStart(6)} car${todos ? `  ⚠ ${todos} placeholder(s)` : ""}`);
  }
  console.log("\nImport terminé.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
