import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getConversationForUser } from "@/lib/messaging";
import { ConversationView } from "@/components/messaging/conversation-view";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dash.messaging.conversation };
}

export default async function AccountConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const conversation = await getConversationForUser(id, user);
  if (!conversation) notFound();
  return <ConversationView conversation={conversation} user={user} basePath="/account/messages" />;
}
