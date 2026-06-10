import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "", "/residences", "/packs", "/packs/custom", "/destinations",
    "/business", "/partners", "/devenir-proprietaire", "/about", "/contact",
    "/faq", "/quality", "/conditions-generales", "/politique-annulation",
    "/confidentialite", "/mentions-legales", "/conditions-partenaires",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  try {
    const [residences, packs, destinations] = await Promise.all([
      prisma.residence.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.pack.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.destination.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticPaths,
      ...residences.map((r) => ({ url: `${BASE}/residences/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...packs.map((p) => ({ url: `${BASE}/packs/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...destinations.map((d) => ({ url: `${BASE}/destinations/${d.slug}`, lastModified: d.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ];
  } catch {
    return staticPaths;
  }
}
