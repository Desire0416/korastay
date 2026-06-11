import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

const activityCardSelect = {
  id: true,
  slug: true,
  name: true,
  category: true,
  shortDescription: true,
  city: true,
  durationHours: true,
  pricePerPerson: true,
  minPersons: true,
  maxPersons: true,
  difficulty: true,
  ratingAverage: true,
  ratingCount: true,
  images: { select: { url: true, altText: true }, orderBy: { sortOrder: "asc" as const }, take: 3 },
} satisfies Prisma.ActivitySelect;

export type ActivityCardData = Awaited<ReturnType<typeof getActivities>>[number];

export async function getActivities(filters?: { city?: string; category?: string }) {
  const where: Prisma.ActivityWhereInput = { status: "PUBLISHED" };
  if (filters?.city) where.destination = { is: { slug: filters.city } };
  if (filters?.category) where.category = filters.category;
  return prisma.activity.findMany({
    where,
    select: activityCardSelect,
    orderBy: [{ ratingAverage: "desc" }, { createdAt: "desc" }],
  });
}

export async function getActivityBySlug(slug: string) {
  return prisma.activity.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, destination: true },
  });
}

export async function getFeaturedActivities(limit = 6) {
  return prisma.activity.findMany({
    where: { status: "PUBLISHED" },
    select: activityCardSelect,
    orderBy: [{ ratingAverage: "desc" }, { ratingCount: "desc" }],
    take: limit,
  });
}

/** Guides touristiques verifies d'une ville (pour l'accompagnement obligatoire).
 *  Repli sur tous les guides verifies si aucun dans la ville (ils peuvent se deplacer). */
export async function getCityGuides(city: string) {
  const select = {
    id: true,
    businessName: true,
    city: true,
    user: { select: { firstName: true, lastName: true, avatarUrl: true } },
  } satisfies Prisma.PartnerProfileSelect;

  const inCity = await prisma.partnerProfile.findMany({
    where: { type: "GUIDE", verificationStatus: "VERIFIED", city: { equals: city } },
    select,
    orderBy: { businessName: "asc" },
  });
  if (inCity.length > 0) return inCity;

  return prisma.partnerProfile.findMany({
    where: { type: "GUIDE", verificationStatus: "VERIFIED" },
    select,
    orderBy: { businessName: "asc" },
  });
}

export async function getActivitySlugs() {
  return prisma.activity.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
}

// --- Admin ---
export async function getAllActivitiesAdmin() {
  return prisma.activity.findMany({
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, destination: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActivityByIdAdmin(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}
