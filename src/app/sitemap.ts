import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

// URL anglaise (/en) correspondant a un chemin FR (path commence par "/" ou "" pour l'accueil).
const enUrl = (path: string) => `${SITE_URL}/en${path}`;

// Alternates hreflang FR/EN pour une entree de sitemap.
const langs = (path: string) => ({
  languages: { "fr-FR": `${SITE_URL}${path}`, "en-US": enUrl(path) },
});

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
    alternates: langs(p),
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
      ...residences.map((r) => ({ url: `${SITE_URL}/residences/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "weekly" as const, priority: 0.8, alternates: langs(`/residences/${r.slug}`) })),
      ...packs.map((p) => ({ url: `${SITE_URL}/packs/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8, alternates: langs(`/packs/${p.slug}`) })),
      ...activities.map((a) => ({ url: `${SITE_URL}/activites/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "weekly" as const, priority: 0.7, alternates: langs(`/activites/${a.slug}`) })),
      ...destinations.map((d) => ({ url: `${SITE_URL}/destinations/${d.slug}`, lastModified: d.updatedAt, changeFrequency: "monthly" as const, priority: 0.6, alternates: langs(`/destinations/${d.slug}`) })),
      ...posts.map((b) => ({ url: `${SITE_URL}/blog/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly" as const, priority: 0.5, alternates: langs(`/blog/${b.slug}`) })),
    ];
  } catch {
    return staticPaths;
  }
}
