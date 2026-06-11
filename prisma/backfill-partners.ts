/* eslint-disable no-console */
// Backfill idempotent : evite de bloquer les partenaires existants derriere
// l'onboarding, ajoute des donnees de demo aux espaces specialises, et cree
// un partenaire restaurant de demo (non onboarde) pour tester le flux complet.
//   npx tsx prisma/backfill-partners.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const img = (s: string) => `https://picsum.photos/seed/${s}/600/450`;

const DEMO_DISHES = [
  { name: "Attieke poisson braise", description: "Attieke, poisson entier, sauce tomate pimentee", price: 3500, category: "Plats" },
  { name: "Poulet bicyclette", description: "Poulet local grille, alloco, oignons", price: 4000, category: "Plats" },
  { name: "Garba", description: "Attieke et thon frit, le classique du midi", price: 1500, category: "Plats" },
  { name: "Bissap maison", description: "Jus d'hibiscus frais", price: 1000, category: "Boissons" },
  { name: "Degue", description: "Dessert au mil et lait caille", price: 1200, category: "Desserts" },
];

async function addMenu(partnerProfileId: string) {
  await prisma.partnerMenuItem.createMany({
    data: DEMO_DISHES.map((d, i) => ({
      partnerProfileId, name: d.name, description: d.description, price: d.price,
      category: d.category, imageUrl: img(`dish-${partnerProfileId}-${i}`), sortOrder: i, isAvailable: true,
    })),
  });
}

async function main() {
  const partners = await prisma.partnerProfile.findMany({ include: { _count: { select: { menuItems: true } } } });

  let onboarded = 0, vehicles = 0, menus = 0;
  for (const p of partners) {
    if (p.verificationStatus === "VERIFIED" && !p.onboardingCompletedAt) {
      await prisma.partnerProfile.update({ where: { id: p.id }, data: { onboardingCompletedAt: p.createdAt } });
      onboarded++;
    }
    if (p.type === "TRANSPORT" && !p.vehicleType) {
      await prisma.partnerProfile.update({
        where: { id: p.id },
        data: { vehicleType: "Berline", vehicleBrand: "Toyota Corolla", vehiclePlate: "1234 AB 01", vehicleSeats: 4 },
      });
      vehicles++;
    }
    if (p.type === "RESTAURANT" && p._count.menuItems === 0) { await addMenu(p.id); menus++; }
  }

  // Partenaire restaurant de demo : VERIFIE mais NON onboarde -> demontre le flux complet.
  const email = "resto@korastay.com";
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const user = await prisma.user.create({
      data: { firstName: "Mariam", lastName: "Toure", email, passwordHash, role: "PARTNER", status: "ACTIVE", emailVerifiedAt: new Date(), city: "Abidjan", phone: "+225 07 88 99 00 11" },
    });
    const profile = await prisma.partnerProfile.create({
      data: {
        userId: user.id, type: "RESTAURANT", businessName: "Maquis Chez Mariam",
        description: "Cuisine ivoirienne authentique au coeur d'Abidjan.", city: "Abidjan",
        cuisineType: "Ivoirienne / maquis", verificationStatus: "VERIFIED",
        // onboardingCompletedAt volontairement absent -> onboarding a faire
      },
    });
    await addMenu(profile.id);
    console.log(`+ Partenaire restaurant de demo cree : ${email} / Password123! (onboarding a tester)`);
  } else {
    console.log(`= ${email} existe deja.`);
  }

  console.log(`Backfill : ${onboarded} onboarding, ${vehicles} vehicules demo, ${menus} menus demo.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
