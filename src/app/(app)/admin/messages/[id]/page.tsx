import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getConversationForUser } from "@/lib/messaging";
import { ConversationView } from "@/components/messaging/conversation-view";

export const metadata = { title: "Conversation - Admin" };

export default async function AdminConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const conversation = await getConversationForUser(id, user);
  if (!conversation) notFound();
  return <ConversationView conversation={conversation} user={user} basePath="/admin/messages" />;
}
