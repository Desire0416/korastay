import { prisma } from "./prisma";

export async function getPublishedPosts(limit?: number) {
  return prisma.blogPost.findMany({
    where: { isPublished: true },
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { firstName: true, lastName: true } } },
  });
}

export async function getRelatedPosts(excludeSlug: string, limit = 3) {
  return prisma.blogPost.findMany({
    where: { isPublished: true, slug: { not: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function getAllPostsAdmin() {
  return prisma.blogPost.findMany({
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { updatedAt: "desc" },
  });
}
