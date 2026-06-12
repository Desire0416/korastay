import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { MessageThread, type ThreadMessage } from "./message-thread";
import { roleLabelFor, type getConversationForUser } from "@/lib/messaging";
import type { SessionUser } from "@/lib/auth";

type ConversationData = NonNullable<Awaited<ReturnType<typeof getConversationForUser>>>;

interface ConversationViewProps {
  conversation: ConversationData;
  user: SessionUser;
  basePath: string;
}

export function ConversationView({ conversation, user, basePath }: ConversationViewProps) {
  const others = conversation.participants.filter((p: { userId: string }) => p.userId !== user.id);
  const title =
    conversation.subject ||
    (others.length
      ? others.map((p: { user: { firstName: string; lastName: string } }) => `${p.user.firstName} ${p.user.lastName}`).join(", ")
      : "Conversation");
  const subtitle = others
    .map((p: { roleLabel: string | null; user: { role: string } }) => p.roleLabel ?? roleLabelFor(p.user.role))
    .filter(Boolean)
    .join(" · ");

  const messages: ThreadMessage[] = conversation.messages.map(
    (m: {
      id: string; body: string; isInternal: boolean; createdAt: Date;
      attachmentUrl?: string | null; attachmentName?: string | null; attachmentType?: string | null;
      sender: { id: string; firstName: string; lastName: string; role: string };
    }) => ({
      id: m.id,
      body: m.body,
      isInternal: m.isInternal,
      attachmentUrl: m.attachmentUrl ?? null,
      attachmentName: m.attachmentName ?? null,
      attachmentType: m.attachmentType ?? null,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender,
    })
  );

  const res = conversation.reservation;

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--header-h)-2rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
      {/* En-tete */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href={basePath} className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-soft" aria-label="Retour">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-foreground">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
      </div>

      {/* Contexte reservation */}
      {res && (
        <div className="flex items-center gap-2 border-b border-border bg-surface-soft/50 px-4 py-2 text-xs text-muted">
          <Info className="h-3.5 w-3.5" />
          A propos de la réservation <span className="font-semibold text-foreground">{res.reference}</span>
          {res.residence && <> — {res.residence.name}</>}
          {res.pack && <> — {res.pack.name}</>}
        </div>
      )}

      <MessageThread
        conversationId={conversation.id}
        messages={messages}
        currentUserId={user.id}
        canInternalNote={conversation.staff}
      />
    </div>
  );
}
