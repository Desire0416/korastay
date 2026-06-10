import { MessageCircle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getUserConversations } from "@/lib/messaging";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { StartSupportButton } from "@/components/messaging/start-support-button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Messages" };

export default async function OwnerMessagesPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const conversations = await getUserConversations(user);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Messages" description="Echangez avec vos voyageurs et l'assistance KoraStay." actions={<StartSupportButton />} />
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Aucune conversation" description="Contactez un voyageur depuis une reservation, ou l'assistance KoraStay." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
          <ConversationList conversations={conversations} basePath="/owner/messages" />
        </div>
      )}
    </div>
  );
}
