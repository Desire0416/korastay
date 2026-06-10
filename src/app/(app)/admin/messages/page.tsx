import { MessageCircle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAllConversations } from "@/lib/messaging";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Messages & assistance - Admin" };

export default async function AdminMessagesPage() {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const conversations = await getAllConversations(user);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Messages & assistance" description="Toutes les conversations de la plateforme. Repondez et ajoutez des notes internes." />
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Aucune conversation" description="Les demandes d'assistance et discussions apparaitront ici." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
          <ConversationList conversations={conversations} basePath="/admin/messages" />
        </div>
      )}
    </div>
  );
}
