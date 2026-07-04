import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { SessionUser } from "./auth";

export function isStaff(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "SUPPORT";
}

export function roleLabelFor(role: string): string {
  switch (role) {
    case "TRAVELER": return "Voyageur";
    case "OWNER": return "Hôte";
    case "PARTNER": return "Partenaire";
    case "BUSINESS": return "Business";
    case "ADMIN":
    case "SUPER_ADMIN":
    case "SUPPORT": return "Assistance KoraStay";
    default: return "Membre";
  }
}

export type ConversationSummary = {
  id: string;
  subject: string | null;
  contextType: string;
  lastMessageAt: Date | null;
  updatedAt: Date;
  otherParticipants: { id: string; name: string; roleLabel: string | null }[];
  lastMessage: { body: string; senderId: string; createdAt: Date; isInternal: boolean } | null;
  unread: number;
};

/** Conversations auxquelles l'utilisateur participe. */
export async function getUserConversations(user: SessionUser): Promise<ConversationSummary[]> {
  const convos = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });
  return buildSummaries(convos, user);
}

/** Toutes les conversations (boite de reception admin/support). */
export async function getAllConversations(user: SessionUser): Promise<ConversationSummary[]> {
  const convos = await prisma.conversation.findMany({
    include: {
      participants: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });
  return buildSummaries(convos, user, true);
}

type RawConvo = Awaited<ReturnType<typeof prisma.conversation.findMany>>[number] & {
  participants: { userId: string; roleLabel: string | null; lastReadAt: Date | null; user: { id: string; firstName: string; lastName: string; role: string } }[];
  messages: { body: string; senderId: string; createdAt: Date; isInternal: boolean }[];
};

// Compte les messages non lus par conversation en UNE requete groupee
// (au lieu d'un count() par conversation -> N+1 qui saturait le pool).
// LEFT JOIN sur la participation de l'utilisateur : si absent (cas staff non
// participant), lastReadAt vaut NULL et tous les messages comptent — semantique
// identique a l'ancienne boucle.
async function unreadByConversation(
  userId: string,
  conversationIds: string[],
  staff: boolean,
): Promise<Map<string, number>> {
  if (conversationIds.length === 0) return new Map();
  const rows = await prisma.$queryRaw<{ conversationId: string; unread: number }[]>`
    SELECT c.id AS "conversationId",
      COUNT(m.id) FILTER (
        WHERE m."senderId" <> ${userId}
          AND (${staff}::boolean OR m."isInternal" = false)
          AND (cp."lastReadAt" IS NULL OR m."createdAt" > cp."lastReadAt")
      )::int AS "unread"
    FROM "Conversation" c
    LEFT JOIN "ConversationParticipant" cp
      ON cp."conversationId" = c.id AND cp."userId" = ${userId}
    LEFT JOIN "Message" m ON m."conversationId" = c.id
    WHERE c.id IN (${Prisma.join(conversationIds)})
    GROUP BY c.id
  `;
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.conversationId, Number(r.unread));
  return map;
}

async function buildSummaries(convos: unknown[], user: SessionUser, staff = false): Promise<ConversationSummary[]> {
  const list = convos as RawConvo[];
  const unreadMap = await unreadByConversation(user.id, list.map((c) => c.id), staff);
  return list.map((c) => {
    const last = c.messages[0] ?? null;
    return {
      id: c.id,
      subject: c.subject,
      contextType: c.contextType,
      lastMessageAt: c.lastMessageAt,
      updatedAt: c.updatedAt,
      otherParticipants: c.participants
        .filter((p) => p.userId !== user.id)
        .map((p) => ({ id: p.user.id, name: `${p.user.firstName} ${p.user.lastName}`, roleLabel: p.roleLabel ?? roleLabelFor(p.user.role) })),
      lastMessage: last ? { body: last.body, senderId: last.senderId, createdAt: last.createdAt, isInternal: last.isInternal } : null,
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}

/** Detail d'une conversation avec controle d'acces. Marque comme lue. */
export async function getConversationForUser(conversationId: string, user: SessionUser) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } } } },
      reservation: { select: { reference: true, residence: { select: { name: true, slug: true } }, pack: { select: { name: true } } } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
      },
    },
  });
  if (!convo) return null;

  const staff = isStaff(user.role);
  const isParticipant = convo.participants.some((p) => p.userId === user.id);
  if (!isParticipant && !staff) return null;

  // Filtre les notes internes pour les non-staff
  const messages = convo.messages.filter((m) => staff || !m.isInternal);

  // Marque comme lue
  if (isParticipant) {
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: user.id },
      data: { lastReadAt: new Date() },
    });
  }

  return { ...convo, messages, staff, isParticipant };
}

// Total de messages non lus (badge du header) en UNE requete au lieu d'un
// count() par conversation. L'utilisateur est toujours participant de ses
// conversations -> semantique identique a l'ancienne boucle.
export async function getUnreadMessageCount(user: SessionUser): Promise<number> {
  const rows = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COUNT(m.id)::int AS "total"
    FROM "ConversationParticipant" cp
    JOIN "Message" m ON m."conversationId" = cp."conversationId"
    WHERE cp."userId" = ${user.id}
      AND m."senderId" <> ${user.id}
      AND m."isInternal" = false
      AND (cp."lastReadAt" IS NULL OR m."createdAt" > cp."lastReadAt")
  `;
  return Number(rows[0]?.total ?? 0);
}
