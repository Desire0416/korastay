import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStaff } from "@/lib/messaging";

// Endpoint leger pour le polling temps reel du fil de discussion.
// Renvoie les messages de la conversation (notes internes filtrees pour les non-staff)
// et marque la conversation comme lue pour l'utilisateur courant.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const { id } = await params;

  const convo = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      participants: { select: { userId: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
      },
    },
  });
  if (!convo) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const staff = isStaff(user.role);
  const isParticipant = convo.participants.some((p) => p.userId === user.id);
  if (!isParticipant && !staff) return NextResponse.json({ error: "Acces refuse." }, { status: 403 });

  // Marque comme lue (best-effort)
  if (isParticipant) {
    await prisma.conversationParticipant
      .updateMany({ where: { conversationId: id, userId: user.id }, data: { lastReadAt: new Date() } })
      .catch(() => undefined);
  }

  const messages = convo.messages
    .filter((m) => staff || !m.isInternal)
    .map((m) => ({
      id: m.id,
      body: m.body,
      isInternal: m.isInternal,
      attachmentUrl: m.attachmentUrl,
      attachmentName: m.attachmentName,
      attachmentType: m.attachmentType,
      createdAt: m.createdAt.toISOString(),
      sender: { id: m.sender.id, firstName: m.sender.firstName, lastName: m.sender.lastName, role: m.sender.role },
    }));

  return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
}
