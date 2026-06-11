/* eslint-disable no-console */
// Ajout idempotent des activites de demonstration (n'efface rien).
//   npx tsx prisma/seed-activities.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const img = (s: string) => `https://picsum.photos/seed/${s}/1200/900`;

const specs = [
  { name: "Ascension de la Dent de Man", slug: "ascension-dent-de-man", category: "AVENTURE", city: "Man", citySlug: "man", durationHours: 6, price: 18000, min: 2, max: 8, difficulty: "Sportif", included: "Guide certifie\nEau et collation\nTransport aller-retour", meetingPoint: "Place centrale de Man, 7h", description: "Randonnee jusqu'au sommet emblematique de la Dent de Man, avec vue panoramique sur les dix-huit montagnes. Une aventure sportive encadree par un guide local." },
  { name: "Cascades & pont de lianes de Man", slug: "cascades-pont-de-lianes-man", category: "NATURE", city: "Man", citySlug: "man", durationHours: 4, price: 12000, min: 1, max: 10, difficulty: "Modere", included: "Guide\nEntrees des sites\nTransport", meetingPoint: "Hotel Les Cascades, 9h", description: "Decouvrez les cascades rafraichissantes et le mythique pont de lianes, au coeur d'une foret luxuriante. Une immersion nature inoubliable." },
  { name: "Village des singes de Daloa", slug: "village-des-singes-daloa", category: "NATURE", city: "Daloa", citySlug: "daloa", durationHours: 3, price: 9000, min: 1, max: 12, difficulty: "Facile", included: "Guide\nNourriture pour les singes\nVisite commentee", meetingPoint: "Entree du village, 10h", description: "Rencontre avec les singes sacres dans leur environnement naturel, accompagne d'un guide qui vous conte les legendes locales." },
  { name: "Basilique de Yamoussoukro & lac aux caimans", slug: "basilique-yamoussoukro-caimans", category: "VISITE", city: "Yamoussoukro", citySlug: "yamoussoukro", durationHours: 4, price: 14000, min: 1, max: 15, difficulty: "Facile", included: "Guide\nEntree de la basilique\nTransport sur place", meetingPoint: "Parvis de la basilique, 9h30", description: "Visite guidee de la plus grande basilique du monde, suivie du celebre lac aux caimans sacres. Histoire et patrimoine." },
  { name: "Quartier historique de Grand-Bassam (UNESCO)", slug: "quartier-historique-grand-bassam", category: "CULTURE", city: "Grand-Bassam", citySlug: "grand-bassam", durationHours: 3, price: 11000, min: 1, max: 12, difficulty: "Facile", included: "Guide patrimoine\nMusee national du costume\nPromenade", meetingPoint: "Maison du patrimoine, 10h", description: "Plongez dans l'histoire coloniale de l'ancienne capitale, classee au patrimoine mondial de l'UNESCO. Maisons patinees et art vivant." },
  { name: "Atelier batik & toiles de Korhogo", slug: "atelier-batik-korhogo", category: "CULTURE", city: "Korhogo", citySlug: "korhogo", durationHours: 3, price: 10000, min: 1, max: 8, difficulty: "Facile", included: "Guide\nMateriel d'atelier\nVotre creation a emporter", meetingPoint: "Village de Waraniene, 14h", description: "Initiez-vous a l'art ancestral des toiles de Korhogo aupres des artisans senoufo, et repartez avec votre propre creation." },
];

async function main() {
  let added = 0;
  for (const a of specs) {
    const existing = await prisma.activity.findUnique({ where: { slug: a.slug }, select: { id: true } });
    if (existing) { console.log(`= ${a.slug} (existe deja)`); continue; }
    const dest = await prisma.destination.findUnique({ where: { slug: a.citySlug }, select: { id: true } });
    await prisma.activity.create({
      data: {
        slug: a.slug, name: a.name, category: a.category, city: a.city,
        destinationId: dest?.id ?? null,
        description: a.description, shortDescription: a.description.slice(0, 110),
        durationHours: a.durationHours, pricePerPerson: a.price,
        minPersons: a.min, maxPersons: a.max, difficulty: a.difficulty,
        included: a.included, meetingPoint: a.meetingPoint,
        status: "PUBLISHED", isVerified: true,
        ratingAverage: 4.7, ratingCount: 12,
        images: { create: [1, 2, 3].map((n) => ({ url: img(`act-${a.slug}-${n}`), altText: `${a.name} ${n}`, sortOrder: n - 1, isCover: n === 1 })) },
      },
    });
    added++;
    console.log(`+ ${a.slug}`);
  }
  console.log(`\n${added} activite(s) ajoutee(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
