import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { MessageThread, type ThreadMessage } from "./message-thread";
import { roleLabelFor, type getConversationForUser } from "@/lib/messaging";
import type { SessionUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { statusText } from "@/lib/dictionaries/enums";

type ConversationData = NonNullable<Awaited<ReturnType<typeof getConversationForUser>>>;

interface ConversationViewProps {
  conversation: ConversationData;
  user: SessionUser;
  basePath: string;
}

export async function ConversationView({ conversation, user, basePath }: ConversationViewProps) {
  const { locale, dict } = await getI18n();
  const m = dict.dash.messaging;
  const others = conversation.participants.filter((p: { userId: string }) => p.userId !== user.id);
  const title =
    conversation.subject ||
    (others.length
      ? others.map((p: { user: { firstName: string; lastName: string } }) => `${p.user.firstName} ${p.user.lastName}`).join(", ")
      : m.conversation);
  const subtitle = others
    .map((p: { roleLabel: string | null; user: { role: string } }) => statusText(dict, p.roleLabel ?? roleLabelFor(p.user.role)))
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
    <div className="mx-auto flex h-[calc(100dvh-var(--header-h)-3rem)] max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface shadow-card">
      {/* En-tete */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
        <Link href={localePath(basePath, locale)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand-100" aria-label={m.back}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-foreground">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
      </div>

      {/* Contexte reservation */}
      {res && (
        <div className="flex items-center gap-2 border-b border-border bg-sand-50 px-4 py-2 text-xs text-muted">
          <Info className="h-3.5 w-3.5" />
          {m.aboutBooking} <span className="font-semibold text-foreground">{res.reference}</span>
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
