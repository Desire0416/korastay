import { MessageCircle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAllConversations } from "@/lib/messaging";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.community.messages.metaTitle };
}

export default async function AdminMessagesPage() {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const [conversations, { dict }] = await Promise.all([getAllConversations(user), getI18n()]);
  const t = dict.dashAdmin.community.messages;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className={`${card} overflow-hidden`}>
          <ConversationList conversations={conversations} basePath="/admin/messages" />
        </div>
      )}
    </div>
  );
}
