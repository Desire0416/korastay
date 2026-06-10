import { prisma } from "./prisma";

export interface CityService {
  id: string;
  title: string;
  description: string | null;
  priceFrom: number;
  duration: string | null;
  partnerProfileId: string;
  partnerUserId: string;
  partnerType: string;
  partnerName: string;
}

/** Services actifs de partenaires verifies pour une ville donnee. */
export async function getServicesForCity(city: string): Promise<CityService[]> {
  const services = await prisma.partnerService.findMany({
    where: {
      isActive: true,
      partnerProfile: { verificationStatus: "VERIFIED" },
      OR: [{ city: { equals: city } }, { partnerProfile: { city: { equals: city } } }],
    },
    include: { partnerProfile: { select: { id: true, type: true, businessName: true, userId: true } } },
    orderBy: { priceFrom: "asc" },
  });
  return services.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    priceFrom: s.priceFrom ?? 0,
    duration: s.duration,
    partnerProfileId: s.partnerProfile.id,
    partnerUserId: s.partnerProfile.userId,
    partnerType: s.partnerProfile.type,
    partnerName: s.partnerProfile.businessName,
  }));
}

/** Villes (destinations) disposant d'au moins un service partenaire verifie. */
export async function getCitiesWithServices(): Promise<{ slug: string; name: string }[]> {
  const destinations = await prisma.destination.findMany({
    where: { isActive: true },
    select: { slug: true, name: true },
    orderBy: { priority: "asc" },
  });
  const result: { slug: string; name: string }[] = [];
  for (const d of destinations) {
    const count = await prisma.partnerService.count({
      where: {
        isActive: true,
        partnerProfile: { verificationStatus: "VERIFIED" },
        OR: [{ city: { equals: d.name } }, { partnerProfile: { city: { equals: d.name } } }],
      },
    });
    if (count > 0) result.push(d);
  }
  return result;
}

/** Packs publies d'une ville (pour suggestion). */
export async function getCityPacks(citySlug: string) {
  return prisma.pack.findMany({
    where: { status: "PUBLISHED", destination: { slug: citySlug } },
    include: { destination: { select: { name: true } }, images: { take: 1, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "asc" },
    take: 4,
  });
}

export async function getUserCustomPacks(userId: string) {
  return prisma.customPackRequest.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomPackRequest(id: string) {
  return prisma.customPackRequest.findUnique({ where: { id }, include: { items: true } });
}
