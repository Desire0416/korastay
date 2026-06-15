import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "", "/residences", "/packs", "/packs/custom", "/activites", "/destinations",
    "/business", "/partners", "/devenir-proprietaire", "/blog", "/about", "/contact",
    "/faq", "/quality", "/conditions-generales", "/politique-annulation",
    "/confidentialite", "/mentions-legales", "/conditions-partenaires",
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  try {
    const [residences, packs, activities, destinations, posts] = await Promise.all([
      prisma.residence.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.pack.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.activity.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.destination.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticPaths,
      ...residences.map((r) => ({ url: `${SITE_URL}/residences/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...packs.map((p) => ({ url: `${SITE_URL}/packs/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...activities.map((a) => ({ url: `${SITE_URL}/activites/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...destinations.map((d) => ({ url: `${SITE_URL}/destinations/${d.slug}`, lastModified: d.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...posts.map((b) => ({ url: `${SITE_URL}/blog/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ];
  } catch {
    return staticPaths;
  }
}
