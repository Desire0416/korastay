import { prisma } from "./prisma";

export async function getAdminStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    bookingsMonth, paidAgg, publishedResidences, pendingResidences,
    users, pendingPartners, businessRequests, disputes, paidPayments,
  ] = await Promise.all([
    prisma.reservation.count({ where: { createdAt: { gte: startOfMonth }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } } }),
    prisma.reservation.aggregate({ where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } }, _sum: { totalAmount: true } }),
    prisma.residence.count({ where: { status: "PUBLISHED" } }),
    prisma.residence.count({ where: { status: "PENDING_VALIDATION" } }),
    prisma.user.count(),
    prisma.partnerProfile.count({ where: { verificationStatus: "PENDING_REVIEW" } }),
    prisma.businessRequest.count({ where: { status: { in: ["NEW", "IN_REVIEW"] } } }),
    prisma.reservation.count({ where: { status: "DISPUTED" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
  ]);

  return {
    bookingsMonth,
    revenue: paidAgg._sum.totalAmount ?? 0,
    publishedResidences,
    pendingResidences,
    users,
    pendingPartners,
    businessRequests,
    disputes,
    paidPaymentsCount: paidPayments._count,
    paidPaymentsTotal: paidPayments._sum.amount ?? 0,
  };
}

export async function getReservationsByCity() {
  const residences = await prisma.residence.findMany({ select: { id: true, city: true } });
  const cityById = new Map(residences.map((r) => [r.id, r.city]));
  const reservations = await prisma.reservation.findMany({
    where: { residenceId: { not: null }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
    select: { residenceId: true },
  });
  const counts: Record<string, number> = {};
  reservations.forEach((r) => {
    const city = r.residenceId ? cityById.get(r.residenceId) : null;
    if (city) counts[city] = (counts[city] ?? 0) + 1;
  });
  return Object.entries(counts).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count);
}

const MONTHS_FR = ["janv.", "fevr.", "mars", "avr.", "mai", "juin", "juil.", "aout", "sept.", "oct.", "nov.", "dec."];

export async function getMonthlyStats(monthsBack = 6) {
  const start = new Date();
  start.setMonth(start.getMonth() - (monthsBack - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const reservations = await prisma.reservation.findMany({
    where: { createdAt: { gte: start }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
    select: { createdAt: true, totalAmount: true },
  });

  const buckets: { label: string; count: number; revenue: number }[] = [];
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    buckets.push({ label: MONTHS_FR[d.getMonth()], count: 0, revenue: 0 });
  }
  for (const r of reservations) {
    const idx = (r.createdAt.getFullYear() - start.getFullYear()) * 12 + (r.createdAt.getMonth() - start.getMonth());
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].count += 1;
      buckets[idx].revenue += r.totalAmount;
    }
  }
  return buckets;
}

export async function getTopListings(limit = 5) {
  const [resGroups, packGroups] = await Promise.all([
    prisma.reservation.groupBy({
      by: ["residenceId"],
      where: { residenceId: { not: null }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.reservation.groupBy({
      by: ["packId"],
      where: { packId: { not: null }, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
  ]);

  const resIds = resGroups.map((g) => g.residenceId!).filter(Boolean);
  const packIds = packGroups.map((g) => g.packId!).filter(Boolean);
  const [residences, packs] = await Promise.all([
    prisma.residence.findMany({ where: { id: { in: resIds } }, select: { id: true, name: true } }),
    prisma.pack.findMany({ where: { id: { in: packIds } }, select: { id: true, name: true } }),
  ]);
  const resName = new Map(residences.map((r) => [r.id, r.name]));
  const packName = new Map(packs.map((p) => [p.id, p.name]));

  const topResidences = resGroups
    .map((g) => ({ name: resName.get(g.residenceId!) ?? "?", count: g._count._all, revenue: g._sum.totalAmount ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  const topPacks = packGroups
    .map((g) => ({ name: packName.get(g.packId!) ?? "?", count: g._count._all, revenue: g._sum.totalAmount ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { topResidences, topPacks };
}

export async function getRecentReservationsAdmin(limit = 6) {
  return prisma.reservation.findMany({
    include: {
      traveler: { select: { firstName: true, lastName: true } },
      residence: { select: { name: true } },
      pack: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
