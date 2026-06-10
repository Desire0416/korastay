import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getConversationForUser } from "@/lib/messaging";
import { ConversationView } from "@/components/messaging/conversation-view";

export const metadata = { title: "Conversation" };

export default async function AccountConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const conversation = await getConversationForUser(id, user);
  if (!conversation) notFound();
  return <ConversationView conversation={conversation} user={user} basePath="/account/messages" />;
}
