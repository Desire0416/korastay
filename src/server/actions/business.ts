"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type BusinessResult = { ok: boolean; error?: string; message?: string };

async function getAccount(userId: string) {
  const membership = await prisma.businessMember.findFirst({
    where: { userId },
    include: { businessAccount: true },
  });
  return membership?.businessAccount ?? null;
}

export async function acceptBusinessQuote(requestId: string): Promise<BusinessResult> {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const req = await prisma.businessRequest.findUnique({ where: { id: requestId } });
  if (!req) return { ok: false, error: "Demande introuvable." };
  // Le client doit etre rattache a la demande (par email ou compte)
  const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } });
  const isOwn = req.email === user.email || (membership && req.businessAccountId === membership.businessAccountId);
  if (!isOwn && user.role === "BUSINESS") return { ok: false, error: "Acces refuse." };
  if (req.status !== "QUOTED") return { ok: false, error: "Aucun devis a accepter." };

  await prisma.businessRequest.update({ where: { id: requestId }, data: { status: "CONFIRMED", acceptedAt: new Date() } });

  // Notifie l'equipe
  const staff = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } });
  if (staff.length) {
    await prisma.notification.createMany({
      data: staff.map((s) => ({ userId: s.id, title: "Devis accepte", body: `${req.organizationName} a accepte le devis.`, type: "BUSINESS_QUOTE", url: `/admin/business/${requestId}` })),
    });
  }
  revalidatePath("/business/requests");
  revalidatePath(`/business/requests/${requestId}`);
  return { ok: true, message: "Devis accepte ! Notre equipe finalise votre reservation." };
}

export async function createMyBusinessRequest(_prev: BusinessResult, formData: FormData): Promise<BusinessResult> {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const account = await getAccount(user.id);

  const schema = z.object({
    needType: z.string().min(2, "Type de besoin requis"),
    city: z.string().optional(),
    teamSize: z.coerce.number().int().optional(),
    budget: z.coerce.number().int().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await prisma.businessRequest.create({
    data: {
      businessAccountId: account?.id ?? null,
      organizationName: account?.name ?? `${user.firstName} ${user.lastName}`,
      organizationType: account?.organizationType ?? null,
      sector: account?.sector ?? null,
      contactName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone ?? null,
      city: d.city || account?.city || null,
      needType: d.needType,
      missionLocation: d.city || null,
      teamSize: d.teamSize ?? null,
      budget: d.budget ?? null,
      notes: d.notes || null,
      status: "NEW",
    },
  });

  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({ userId: a.id, title: "Nouvelle demande Business", body: `${account?.name ?? user.firstName} : ${d.needType}`, type: "LEAD", url: "/admin/business" })),
    });
  }

  redirect("/business/requests?created=1");
}
