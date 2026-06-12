"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type BlogResult = { ok: boolean; error?: string; message?: string };

const schema = z.object({
  title: z.string().min(3, "Titre requis"),
  excerpt: z.string().optional(),
  body: z.string().min(20, "Contenu trop court (20 caractères min)"),
  coverImageUrl: z.string().optional(),
  isPublished: z.string().optional(),
});

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) break;
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function saveBlogPost(id: string | null, _prev: BlogResult, formData: FormData): Promise<BlogResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const isPublished = d.isPublished === "on" || d.isPublished === "true";

  const data = {
    title: d.title,
    excerpt: d.excerpt?.trim() || null,
    body: d.body,
    coverImageUrl: d.coverImageUrl?.trim() || null,
    isPublished,
  };

  if (id) {
    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
    await prisma.blogPost.update({
      where: { id },
      data: { ...data, publishedAt: isPublished ? existing?.publishedAt ?? new Date() : null },
    });
    revalidatePath("/admin/content/blog");
    revalidatePath("/blog");
    return { ok: true, message: "Article mis a jour." };
  }

  const slug = await uniqueSlug(d.title);
  await prisma.blogPost.create({
    data: { ...data, slug, authorId: admin.id, publishedAt: isPublished ? new Date() : null },
  });
  revalidatePath("/admin/content/blog");
  revalidatePath("/blog");
  redirect("/admin/content/blog?created=1");
}

export async function toggleBlogPublish(id: string): Promise<BlogResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { isPublished: true, publishedAt: true } });
  if (!post) return { ok: false, error: "Introuvable." };
  const next = !post.isPublished;
  await prisma.blogPost.update({ where: { id }, data: { isPublished: next, publishedAt: next ? post.publishedAt ?? new Date() : post.publishedAt } });
  revalidatePath("/admin/content/blog");
  revalidatePath("/blog");
  return { ok: true, message: next ? "Article publié." : "Article dépublié." };
}

export async function deleteBlogPost(id: string): Promise<BlogResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/content/blog");
  revalidatePath("/blog");
  return { ok: true, message: "Article supprimé." };
}
