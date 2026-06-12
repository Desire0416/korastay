"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/email";
import { CONTACT_EMAIL } from "@/lib/constants";

export type LeadResult = { ok: boolean; error?: string; message?: string };

async function notifyAdmins(title: string, body: string, url = "/admin") {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN", "SUPPORT"] } },
    select: { id: true },
  });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, title, body, type: "LEAD", url })),
  });
}

// ------------------------------------------------------------
// Contact
// ------------------------------------------------------------
export async function submitContact(_prev: LeadResult, formData: FormData): Promise<LeadResult> {
  const schema = z.object({
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    subject: z.string().min(2, "Sujet requis"),
    message: z.string().min(10, "Message trop court"),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await notifyAdmins("Nouveau message de contact", `${d.name} : ${d.subject}`);
  await sendEmail({
    to: CONTACT_EMAIL,
    subject: `[Contact] ${d.subject}`,
    html: emailLayout("Nouveau message", `<p><strong>${d.name}</strong> (${d.email})</p><p>${d.message}</p>`),
    text: d.message,
  });
  return { ok: true, message: "Merci ! Votre message a bien ete envoyé. Nous vous repondrons rapidement." };
}

// ------------------------------------------------------------
// Devenir proprietaire
// ------------------------------------------------------------
export async function submitOwnerApplication(_prev: LeadResult, formData: FormData): Promise<LeadResult> {
  const schema = z.object({
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(6, "Téléphone requis"),
    city: z.string().min(2, "Ville requise"),
    residenceCount: z.string().optional(),
    message: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await notifyAdmins("Nouvelle demande propriétaire", `${d.name} (${d.city}) souhaite rejoindre le réseau.`, "/admin/users");
  await sendEmail({
    to: CONTACT_EMAIL,
    subject: `[Propriétaire] ${d.name} - ${d.city}`,
    html: emailLayout("Demande propriétaire", `<p><strong>${d.name}</strong> - ${d.email} - ${d.phone}</p><p>Ville : ${d.city}</p><p>Residences : ${d.residenceCount ?? "-"}</p><p>${d.message ?? ""}</p>`),
  });
  return { ok: true, message: "Demande envoyée ! Notre équipe vous contactera sous 48h pour finaliser votre inscription." };
}

// ------------------------------------------------------------
// Devenir partenaire
// ------------------------------------------------------------
export async function submitPartnerApplication(_prev: LeadResult, formData: FormData): Promise<LeadResult> {
  const schema = z.object({
    businessName: z.string().min(2, "Nom requis"),
    type: z.string().min(2),
    email: z.string().email("Email invalide"),
    phone: z.string().min(6, "Téléphone requis"),
    city: z.string().min(2, "Ville requise"),
    message: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await notifyAdmins("Nouvelle demande partenaire", `${d.businessName} (${d.type}) a ${d.city}.`, "/admin/partners");
  await sendEmail({
    to: CONTACT_EMAIL,
    subject: `[Partenaire] ${d.businessName} - ${d.type}`,
    html: emailLayout("Demande partenaire", `<p><strong>${d.businessName}</strong> (${d.type})</p><p>${d.email} - ${d.phone} - ${d.city}</p><p>${d.message ?? ""}</p>`),
  });
  return { ok: true, message: "Candidature reçue ! Nous etudions votre profil et revenons vers vous rapidement." };
}

// ------------------------------------------------------------
// Demande Business
// ------------------------------------------------------------
export async function submitBusinessRequest(_prev: LeadResult, formData: FormData): Promise<LeadResult> {
  const schema = z.object({
    organizationName: z.string().min(2, "Organisation requise"),
    organizationType: z.string().optional(),
    sector: z.string().optional(),
    contactName: z.string().min(2, "Contact requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    city: z.string().optional(),
    teamSize: z.string().optional(),
    needType: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await prisma.businessRequest.create({
    data: {
      organizationName: d.organizationName,
      organizationType: d.organizationType || null,
      sector: d.sector || null,
      contactName: d.contactName,
      email: d.email,
      phone: d.phone || null,
      city: d.city || null,
      teamSize: d.teamSize ? Number(d.teamSize) : null,
      needType: d.needType || null,
      notes: d.notes || null,
      status: "NEW",
    },
  });
  await notifyAdmins("Nouvelle demande Business", `${d.organizationName} - ${d.contactName}`, "/admin/business");
  await sendEmail({
    to: CONTACT_EMAIL,
    subject: `[Business] ${d.organizationName}`,
    html: emailLayout("Demande Business", `<p><strong>${d.organizationName}</strong></p><p>${d.contactName} - ${d.email}</p><p>${d.notes ?? ""}</p>`),
  });
  return { ok: true, message: "Demande envoyée ! Un conseiller KoraStay Business vous contactera pour etablir un devis." };
}

// ------------------------------------------------------------
// Pack personnalise
// ------------------------------------------------------------
export async function submitCustomPack(_prev: LeadResult, formData: FormData): Promise<LeadResult> {
  const schema = z.object({
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    destination: z.string().min(1, "Destination requise"),
    persons: z.string().optional(),
    budget: z.string().optional(),
    style: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await prisma.businessRequest.create({
    data: {
      organizationName: d.name,
      organizationType: "Particulier",
      contactName: d.name,
      email: d.email,
      phone: d.phone || null,
      city: d.destination,
      needType: `Pack personnalisé - ${d.style ?? "sur mesure"}`,
      missionLocation: d.destination,
      teamSize: d.persons ? Number(d.persons) : null,
      budget: d.budget ? Number(d.budget) : null,
      notes: d.notes || null,
      status: "NEW",
    },
  });
  await notifyAdmins("Demande de pack personnalisé", `${d.name} - ${d.destination}`, "/admin/business");
  return { ok: true, message: "Votre demande de pack personnalisé est envoyée ! Nous composons votre séjour et revenons avec une proposition." };
}
