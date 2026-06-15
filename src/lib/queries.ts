import { unstable_cache } from "next/cache";
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
  latitude: true,
  longitude: true,
  destination: { select: { latitude: true, longitude: true } },
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

// Residences regroupees par ville (sections facon "Logements a {ville}" Airbnb mobile).
export async function getResidencesByCity(maxCities = 3, perCity = 8) {
  const grouped = await prisma.residence.groupBy({
    by: ["city"],
    where: { status: "PUBLISHED" },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
    take: maxCities,
  });
  return Promise.all(
    grouped.map(async (g) => ({
      city: g.city,
      count: g._count.city,
      residences: await prisma.residence.findMany({
        where: { status: "PUBLISHED", city: g.city },
        select: residenceCardSelect,
        orderBy: [{ ratingAverage: "desc" }, { ratingCount: "desc" }],
        take: perCity,
      }),
    }))
  );
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
  checkin?: string; // ISO (yyyy-mm-dd) — filtre de disponibilite
  checkout?: string;
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

  // Recherche par disponibilite : on exclut les residences ayant une
  // reservation qui chevauche (ferme, ou hold en attente NON expire) ou un
  // blocage proprietaire sur l'intervalle demande. Coherent avec la verif faite
  // a la reservation (cf. createResidenceReservation).
  if (filters.checkin && filters.checkout) {
    const ci = new Date(filters.checkin);
    const co = new Date(filters.checkout);
    if (!Number.isNaN(ci.getTime()) && !Number.isNaN(co.getTime()) && co > ci) {
      const now = new Date();
      where.reservations = {
        none: {
          startDate: { lt: co },
          endDate: { gt: ci },
          OR: [
            { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
            {
              status: { in: ["PENDING_PAYMENT", "PENDING_APPROVAL"] },
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
          ],
        },
      };
      where.availabilityBlocks = {
        none: { startDate: { lt: co }, endDate: { gt: ci } },
      };
    }
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
        // Dates indisponibles : reservations fermes + holds en attente NON
        // expires (un hold de paiement expire libere la date).
        where: {
          OR: [
            { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
            {
              status: "PENDING_PAYMENT",
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          ],
        },
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

// ------------------------------------------------------------
// Statistiques communaute (compteur public) : nombre de visites
// de la plateforme + comptes crees par type. Mis en cache 2 min
// pour ne pas multiplier les requetes a chaque chargement.
// ------------------------------------------------------------
export type CommunityStats = {
  visits: number;
  travelers: number;
  owners: number;
  guides: number;
  partners: number;
};

// Compteur public "communaute" : nombre de visites + comptes crees par type.
// L'admin peut masquer la section (reglage community_stats_visible) tant que
// les chiffres sont faibles -> on renvoie alors null et on n'execute AUCUNE
// requete de comptage. Mis en cache 2 min ; tag "community-stats" revalide par
// la page admin lors du basculement de l'interrupteur.
export const getCommunityStats = unstable_cache(
  async (): Promise<CommunityStats | null> => {
    const visible = await prisma.setting.findUnique({
      where: { key: "community_stats_visible" },
    });
    if (visible?.value !== "true") return null; // masque par defaut

    const [usersByRole, partnersByType, visitsRow] = await Promise.all([
      // Un seul groupBy couvre tous les roles (on exclut les comptes non confirmes).
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
        where: { status: { not: "PENDING_EMAIL_VERIFICATION" } },
      }),
      // Repartition des partenaires par metier (guide / transport / resto...).
      prisma.partnerProfile.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.setting.findUnique({ where: { key: "visits_total" } }),
    ]);

    const roleCount = (role: string) =>
      usersByRole.find((u) => u.role === role)?._count._all ?? 0;
    const guides = partnersByType.find((p) => p.type === "GUIDE")?._count._all ?? 0;
    const partnersTotal = partnersByType.reduce((sum, p) => sum + p._count._all, 0);

    return {
      visits: Number(visitsRow?.value ?? 0),
      travelers: roleCount("TRAVELER"),
      owners: roleCount("OWNER"),
      guides,
      partners: partnersTotal - guides, // autres partenaires (resto, transport, activites...)
    };
  },
  ["community-stats-v3"],
  { revalidate: 120, tags: ["community-stats"] },
);
