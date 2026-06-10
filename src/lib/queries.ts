import { prisma } from "./prisma";
import { PAGE_SIZE } from "./constants";
import type { Prisma } from "@prisma/client";

// ------------------------------------------------------------
// Residences
// ------------------------------------------------------------
export type ResidenceCardData = Awaited<
  ReturnType<typeof getFeaturedResidences>
>[number];

const residenceCardSelect = {
  id: true,
  slug: true,
  name: true,
  type: true,
  city: true,
  district: true,
  shortDescription: true,
  pricePerNight: true,
  capacity: true,
  bedrooms: true,
  isVerified: true,
  qualityLevel: true,
  ratingAverage: true,
  ratingCount: true,
  images: {
    select: { url: true, altText: true },
    orderBy: { sortOrder: "asc" },
    take: 5,
  },
} satisfies Prisma.ResidenceSelect;

export async function getFeaturedResidences(limit = 6) {
  return prisma.residence.findMany({
    where: { status: "PUBLISHED", isVerified: true },
    select: residenceCardSelect,
    orderBy: [{ ratingAverage: "desc" }, { ratingCount: "desc" }],
    take: limit,
  });
}

export interface ResidenceFilters {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  verified?: boolean;
  amenities?: string[];
  sort?: string;
  page?: number;
}

export async function getResidences(filters: ResidenceFilters) {
  const where: Prisma.ResidenceWhereInput = { status: "PUBLISHED" };

  if (filters.city) where.destination = { slug: filters.city };
  if (filters.type && filters.type !== "any") where.type = filters.type;
  if (filters.verified) where.isVerified = true;
  if (filters.capacity) where.capacity = { gte: filters.capacity };
  if (filters.minPrice || filters.maxPrice) {
    where.pricePerNight = {};
    if (filters.minPrice) where.pricePerNight.gte = filters.minPrice;
    if (filters.maxPrice) where.pricePerNight.lte = filters.maxPrice;
  }
  if (filters.amenities && filters.amenities.length > 0) {
    where.AND = filters.amenities.map((slug) => ({
      amenities: { some: { amenity: { slug } } },
    }));
  }

  const orderBy: Prisma.ResidenceOrderByWithRelationInput[] = (() => {
    switch (filters.sort) {
      case "price_asc": return [{ pricePerNight: "asc" }];
      case "price_desc": return [{ pricePerNight: "desc" }];
      case "rating": return [{ ratingAverage: "desc" }];
      case "recent": return [{ publishedAt: "desc" }];
      default: return [{ isVerified: "desc" }, { ratingAverage: "desc" }];
    }
  })();

  const page = Math.max(1, filters.page ?? 1);

  const [items, total] = await Promise.all([
    prisma.residence.findMany({
      where,
      select: residenceCardSelect,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.residence.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.ceil(total / PAGE_SIZE) };
}

export async function getResidenceBySlug(slug: string) {
  return prisma.residence.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      destination: true,
      owner: { select: { firstName: true, lastName: true, createdAt: true, avatarUrl: true } },
      availabilityBlocks: { select: { startDate: true, endDate: true } },
      reviews: {
        where: { status: "PUBLISHED" },
        include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
      reservations: {
        where: { status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] } },
        select: { startDate: true, endDate: true },
      },
    },
  });
}

export async function getSimilarResidences(
  city: string,
  excludeId: string,
  limit = 3
) {
  return prisma.residence.findMany({
    where: { status: "PUBLISHED", city, id: { not: excludeId } },
    select: residenceCardSelect,
    take: limit,
    orderBy: { ratingAverage: "desc" },
  });
}

export async function getResidenceSlugs() {
  return prisma.residence.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
}

// ------------------------------------------------------------
// Packs
// ------------------------------------------------------------
export async function getPacks(filters?: { destination?: string }) {
  return prisma.pack.findMany({
    where: {
      status: "PUBLISHED",
      ...(filters?.destination ? { destination: { slug: filters.destination } } : {}),
    },
    include: {
      destination: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { includedItems: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPackBySlug(slug: string) {
  return prisma.pack.findUnique({
    where: { slug },
    include: {
      destination: true,
      images: { orderBy: { sortOrder: "asc" } },
      includedItems: { orderBy: { sortOrder: "asc" } },
      programDays: {
        orderBy: { sortOrder: "asc" },
        include: { activities: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

// ------------------------------------------------------------
// Destinations
// ------------------------------------------------------------
export async function getPopularDestinations(limit = 6) {
  const destinations = await prisma.destination.findMany({
    where: { isActive: true },
    orderBy: { priority: "asc" },
    take: limit,
    include: { _count: { select: { residences: true, packs: true } } },
  });
  return destinations;
}

export async function getAllDestinations() {
  return prisma.destination.findMany({
    where: { isActive: true },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
    include: { _count: { select: { residences: true, packs: true } } },
  });
}

export async function getDestinationBySlug(slug: string) {
  return prisma.destination.findUnique({
    where: { slug },
    include: {
      residences: {
        where: { status: "PUBLISHED" },
        select: residenceCardSelect,
        orderBy: { ratingAverage: "desc" },
      },
      packs: { where: { status: "PUBLISHED" }, include: { images: { take: 1 } } },
    },
  });
}

// ------------------------------------------------------------
// Avis (home testimonials)
// ------------------------------------------------------------
export async function getRecentReviews(limit = 6) {
  return prisma.review.findMany({
    where: { status: "PUBLISHED", comment: { not: null } },
    include: {
      author: { select: { firstName: true, lastName: true, avatarUrl: true } },
      residence: { select: { name: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ------------------------------------------------------------
// Contenu
// ------------------------------------------------------------
export async function getContentPage(slug: string) {
  return prisma.contentPage.findUnique({ where: { slug } });
}

// ------------------------------------------------------------
// Stats accueil
// ------------------------------------------------------------
export async function getPlatformStats() {
  const [residences, destinations, packs] = await Promise.all([
    prisma.residence.count({ where: { status: "PUBLISHED" } }),
    prisma.destination.count({ where: { isActive: true } }),
    prisma.pack.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { residences, destinations, packs };
}
