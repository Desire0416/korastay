import { prisma } from "./prisma";

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function getTravelerReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { travelerId: userId },
    include: {
      residence: { select: { name: true, city: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } },
      pack: { select: { name: true, slug: true, destination: { select: { name: true } }, images: { take: 1 } } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      review: { select: { id: true } },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getReservationDetail(userId: string, id: string) {
  return prisma.reservation.findFirst({
    where: { id, travelerId: userId },
    include: {
      residence: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, owner: { select: { id: true, firstName: true, phone: true } } } },
      pack: { include: { images: { take: 1 }, destination: true, programDays: { include: { activities: true }, orderBy: { sortOrder: "asc" } } } },
      payments: { orderBy: { createdAt: "desc" } },
      refunds: true,
      review: true,
    },
  });
}

export async function getTravelerFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      residence: {
        select: {
          id: true, slug: true, name: true, type: true, city: true, district: true,
          shortDescription: true, pricePerNight: true, capacity: true, bedrooms: true,
          isVerified: true, qualityLevel: true, ratingAverage: true, ratingCount: true,
          images: { select: { url: true, altText: true }, orderBy: { sortOrder: "asc" }, take: 5 },
        },
      },
      pack: {
        select: {
          id: true, slug: true, name: true, subtitle: true, price: true,
          durationDays: true, durationNights: true, basePersons: true,
          destination: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return {
    residences: favorites.filter((f) => f.residence).map((f) => f.residence!),
    packs: favorites.filter((f) => f.pack).map((f) => f.pack!),
  };
}

export async function getReviewableReservations(userId: string) {
  return prisma.reservation.findMany({
    where: {
      travelerId: userId,
      status: "COMPLETED",
      review: null,
    },
    include: {
      residence: { select: { name: true, city: true, images: { take: 1 } } },
      pack: { select: { name: true } },
    },
    orderBy: { endDate: "desc" },
  });
}

export async function getTravelerReviews(userId: string) {
  return prisma.review.findMany({
    where: { authorId: userId },
    include: {
      residence: { select: { name: true, slug: true, city: true } },
      pack: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getTravelerStats(userId: string) {
  const [upcoming, completed, favorites, reviews] = await Promise.all([
    prisma.reservation.count({ where: { travelerId: userId, status: { in: ["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN"] }, startDate: { gte: new Date() } } }),
    prisma.reservation.count({ where: { travelerId: userId, status: "COMPLETED" } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.review.count({ where: { authorId: userId } }),
  ]);
  return { upcoming, completed, favorites, reviews };
}
