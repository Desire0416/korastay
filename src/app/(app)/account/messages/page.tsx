import { MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserConversations } from "@/lib/messaging";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { StartSupportButton } from "@/components/messaging/start-support-button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Messages" };

export default async function AccountMessagesPage() {
  const user = await requireUser();
  const conversations = await getUserConversations(user);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Messages" description="Echangez avec vos hôtes et l'assistance KoraStay." actions={<StartSupportButton />} />
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Aucune conversation" description="Contactez l'assistance ou un hôte depuis une réservation pour demarrer une discussion." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
          <ConversationList conversations={conversations} basePath="/account/messages" />
        </div>
      )}
    </div>
  );
}
