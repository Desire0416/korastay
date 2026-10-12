import { MessageCircle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getUserConversations } from "@/lib/messaging";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { StartSupportButton } from "@/components/messaging/start-support-button";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dash.messaging.title };
}

export default async function OwnerMessagesPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [conversations, { dict }] = await Promise.all([getUserConversations(user), getI18n()]);
  const t = dict.dashOwner.messages;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={dict.dash.messaging.title} description={t.subtitle} actions={<StartSupportButton />} />
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className={`${card} overflow-hidden`}>
          <ConversationList conversations={conversations} basePath="/owner/messages" />
        </div>
      )}
    </div>
  );
}
