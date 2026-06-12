import { MessageCircle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getUserConversations } from "@/lib/messaging";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { StartSupportButton } from "@/components/messaging/start-support-button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Messages" };

export default async function PartnerMessagesPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const conversations = await getUserConversations(user);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Messages" description="Echangez avec l'équipe KoraStay." actions={<StartSupportButton label="Contacter KoraStay" />} />
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Aucune conversation" description="Contactez l'équipe KoraStay pour toute question sur vos missions ou votre profil." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
          <ConversationList conversations={conversations} basePath="/partner/messages" />
        </div>
      )}
    </div>
  );
}
