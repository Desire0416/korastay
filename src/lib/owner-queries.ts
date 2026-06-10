import { prisma } from "./prisma";

export async function getOwnerStats(ownerId: string) {
  const residenceIds = (
    await prisma.residence.findMany({ where: { ownerId }, select: { id: true } })
  ).map((r) => r.id);

  const [published, pending, bookings, paidAgg, reviews] = await Promise.all([
    prisma.residence.count({ where: { ownerId, status: "PUBLISHED" } }),
    prisma.residence.count({ where: { ownerId, status: "PENDING_VALIDATION" } }),
    prisma.reservation.count({ where: { residenceId: { in: residenceIds }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } } }),
    prisma.reservation.aggregate({
      where: { residenceId: { in: residenceIds }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
      _sum: { subtotalAmount: true },
    }),
    prisma.review.count({ where: { residenceId: { in: residenceIds } } }),
  ]);

  return {
    published,
    pending,
    bookings,
    revenue: paidAgg._sum.subtotalAmount ?? 0,
    reviews,
  };
}

export async function getOwnerResidences(ownerId: string) {
  return prisma.residence.findMany({
    where: { ownerId },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      _count: { select: { reservations: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOwnerResidence(ownerId: string, id: string) {
  return prisma.residence.findFirst({
    where: { id, ownerId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      availabilityBlocks: { orderBy: { startDate: "asc" } },
      reservations: {
        where: { status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] } },
        select: { startDate: true, endDate: true, reference: true, guestName: true },
      },
    },
  });
}

export async function getOwnerBookings(ownerId: string) {
  return prisma.reservation.findMany({
    where: { residence: { ownerId } },
    include: {
      residence: { select: { name: true, city: true, slug: true, images: { take: 1 } } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOwnerReviews(ownerId: string) {
  return prisma.review.findMany({
    where: { residence: { ownerId } },
    include: {
      author: { select: { firstName: true, lastName: true } },
      residence: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOwnerRevenue(ownerId: string) {
  const reservations = await prisma.reservation.findMany({
    where: { residence: { ownerId }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
    include: { residence: { select: { name: true } } },
    orderBy: { confirmedAt: "desc" },
  });
  const total = reservations.reduce((sum, r) => sum + r.subtotalAmount, 0);
  return { reservations, total };
}

export async function getOwnerCalendarData(ownerId: string) {
  return prisma.residence.findMany({
    where: { ownerId, status: { in: ["PUBLISHED", "UNPUBLISHED", "PENDING_VALIDATION"] } },
    select: {
      id: true,
      name: true,
      availabilityBlocks: { orderBy: { startDate: "asc" } },
      reservations: {
        where: { status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] } },
        select: { startDate: true, endDate: true, reference: true, guestName: true },
      },
    },
  });
}
