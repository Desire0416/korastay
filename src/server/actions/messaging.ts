"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStaff, roleLabelFor } from "@/lib/messaging";

export type MsgResult = { ok: boolean; error?: string; id?: string };

function messagesPathFor(role: string, conversationId: string): string {
  if (isStaff(role)) return `/admin/messages/${conversationId}`;
  switch (role) {
    case "OWNER": return `/owner/messages/${conversationId}`;
    case "PARTNER": return `/partner/messages/${conversationId}`;
    case "BUSINESS": return `/business/messages/${conversationId}`;
    default: return `/account/messages/${conversationId}`;
  }
}

async function notifyParticipants(conversationId: string, exceptUserId: string, senderName: string, preview: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: exceptUserId } },
    include: { user: { select: { id: true, role: true } } },
  });
  if (participants.length === 0) return;
  await prisma.notification.createMany({
    data: participants.map((p) => ({
      userId: p.user.id,
      title: `Nouveau message de ${senderName}`,
      body: preview.slice(0, 120),
      type: "NEW_MESSAGE",
      url: messagesPathFor(p.user.role, conversationId),
    })),
  });
}

// ------------------------------------------------------------
// Envoi d'un message
// ------------------------------------------------------------
export type MessageAttachment = { url: string; name: string; type: string };

export async function sendMessage(
  conversationId: string,
  body: string,
  isInternal = false,
  attachment?: MessageAttachment | null
): Promise<MsgResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };
  const text = body.trim();
  if (!text && !attachment) return { ok: false, error: "Message vide." };

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  });
  if (!convo) return { ok: false, error: "Conversation introuvable." };

  const staff = isStaff(user.role);
  const isParticipant = convo.participants.some((p) => p.userId === user.id);
  if (!isParticipant && !staff) return { ok: false, error: "Accès refuse." };
  if (isInternal && !staff) return { ok: false, error: "Reserve a l'équipe." };

  // Le staff qui repond rejoint la conversation
  if (!isParticipant && staff) {
    await prisma.conversationParticipant.create({
      data: { conversationId, userId: user.id, roleLabel: "Assistance KoraStay", lastReadAt: new Date() },
    }).catch(() => undefined);
  }

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        body: text,
        isInternal,
        attachmentUrl: attachment?.url ?? null,
        attachmentName: attachment?.name ?? null,
        attachmentType: attachment?.type ?? null,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
    prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: user.id },
      data: { lastReadAt: new Date() },
    }),
  ]);

  if (!isInternal) {
    const preview = text || (attachment ? "\u{1F4CE} Pièce jointe" : "");
    await notifyParticipants(conversationId, user.id, `${user.firstName} ${user.lastName}`, preview);
  }

  ["/account", "/owner", "/partner", "/business", "/admin"].forEach((base) => {
    revalidatePath(`${base}/messages`);
    revalidatePath(`${base}/messages/${conversationId}`);
  });
  return { ok: true, id: conversationId };
}

// ------------------------------------------------------------
// Contacter l'assistance (nouvelle conversation support)
// ------------------------------------------------------------
export async function startSupportConversation(
  _prev: MsgResult,
  formData: FormData
): Promise<MsgResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const schema = z.object({
    subject: z.string().min(2, "Sujet requis"),
    message: z.string().min(2, "Message requis"),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const convo = await prisma.conversation.create({
    data: {
      contextType: "SUPPORT_TICKET",
      subject: parsed.data.subject,
      createdById: user.id,
      lastMessageAt: new Date(),
      participants: { create: { userId: user.id, roleLabel: roleLabelFor(user.role), lastReadAt: new Date() } },
      messages: { create: { senderId: user.id, body: parsed.data.message } },
    },
  });

  // Notifie l'equipe (admins + support)
  const staffUsers = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN", "SUPPORT"] } }, select: { id: true } });
  if (staffUsers.length) {
    await prisma.notification.createMany({
      data: staffUsers.map((s) => ({
        userId: s.id, title: "Nouvelle demande d'assistance",
        body: `${user.firstName} ${user.lastName} : ${parsed.data.subject}`,
        type: "NEW_MESSAGE", url: `/admin/messages/${convo.id}`,
      })),
    });
  }

  redirect(`${messagesPathFor(user.role, convo.id)}`);
}

// ------------------------------------------------------------
// Contacter directement un autre utilisateur (hote, voyageur...)
// ------------------------------------------------------------
export async function getOrCreateDirectConversation(opts: {
  otherUserId: string;
  reservationId?: string;
  subject?: string;
}): Promise<MsgResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };
  if (opts.otherUserId === user.id) return { ok: false, error: "Destinataire invalide." };

  const other = await prisma.user.findUnique({ where: { id: opts.otherUserId }, select: { id: true, role: true } });
  if (!other) return { ok: false, error: "Destinataire introuvable." };

  // Cherche une conversation existante entre ces deux utilisateurs (meme reservation si fournie)
  const existing = await prisma.conversation.findFirst({
    where: {
      ...(opts.reservationId ? { reservationId: opts.reservationId } : {}),
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: other.id } } },
      ],
    },
    select: { id: true },
  });
  if (existing) return { ok: true, id: existing.id };

  const convo = await prisma.conversation.create({
    data: {
      contextType: opts.reservationId ? "RESERVATION" : "GENERAL",
      reservationId: opts.reservationId ?? null,
      subject: opts.subject ?? null,
      createdById: user.id,
      participants: {
        create: [
          { userId: user.id, roleLabel: roleLabelFor(user.role), lastReadAt: new Date() },
          { userId: other.id, roleLabel: roleLabelFor(other.role) },
        ],
      },
    },
  });
  return { ok: true, id: convo.id };
}

export async function markConversationRead(conversationId: string): Promise<MsgResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: user.id },
    data: { lastReadAt: new Date() },
  });
  return { ok: true };
}
