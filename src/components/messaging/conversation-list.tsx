"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, initials, relativeTime, truncate } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/messaging";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { statusText } from "@/lib/dictionaries/enums";

interface ConversationListProps {
  conversations: ConversationSummary[];
  basePath: string; // ex: "/account/messages"
  activeId?: string;
}

export function ConversationList({ conversations, basePath, activeId }: ConversationListProps) {
  const dict = useI18n();
  const m = dict.dash.messaging;
  return (
    <div className="divide-y divide-border">
      {conversations.map((c) => {
        const others = c.otherParticipants;
        const title = c.subject ?? (others.length ? others.map((o) => o.name).join(", ") : m.conversation);
        const subtitle = others.length
          ? others.map((o) => (o.roleLabel ? statusText(dict, o.roleLabel) : "")).filter(Boolean).join(" · ")
          : c.contextType === "SUPPORT_TICKET" ? m.support : "";
        const avatarName = others[0]?.name ?? "KS";
        return (
          <Link
            key={c.id}
            href={localePath(`${basePath}/${c.id}`, dict.locale)}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-sand-50",
              activeId === c.id && "bg-sand-100"
            )}
          >
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarFallback>{initials(avatarName.split(" ")[0], avatarName.split(" ")[1])}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={cn("truncate text-sm", c.unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground")}>{title}</p>
                {c.lastMessage && <span className="shrink-0 text-2xs text-muted">{relativeTime(c.lastMessage.createdAt, dict.locale)}</span>}
              </div>
              {subtitle && <p className="truncate text-2xs text-muted">{subtitle}</p>}
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className={cn("truncate text-xs", c.unread > 0 ? "text-foreground" : "text-muted")}>
                  {c.lastMessage ? (c.lastMessage.isInternal ? m.internalPrefix : "") + truncate(c.lastMessage.body, 50) : m.newConversation}
                </p>
                {c.unread > 0 && (
                  <Badge tone="terracotta" size="sm" className="shrink-0 bg-terracotta text-white ring-0">{c.unread}</Badge>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
