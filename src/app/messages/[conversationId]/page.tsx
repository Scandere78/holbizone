import { getConversationMessages, getUserConversations } from "@/actions/message.action";
import { getDbUserId } from "@/actions/user.action";
import { notFound } from "next/navigation";
import ChatHeader from "@/components/messages/ChatHeader";
import MessageInput from "@/components/messages/MessageInput";
import MessageList from "@/components/messages/MessageList";
import ConversationList from "@/components/messages/ConversationList";

interface ChatPageProps {
  params: {
    conversationId: string;
  };
}

async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = params;

  const [conversations, messages, currentUserId] = await Promise.all([
    getUserConversations(),
    getConversationMessages(conversationId),
    getDbUserId(),
  ]);

  const conversation = conversations.find((c) => c.id === conversationId);

  if (!conversation || !currentUserId) {
    notFound();
  }

  // Récupérer l'autre utilisateur pour les conversations privées
  const otherMember = conversation.isGroup
    ? null
    : conversation.members.find((m) => m.userId !== currentUserId);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Liste des conversations - Desktop only */}
        <div className="hidden md:flex md:col-span-1 border-r border-red-100 dark:border-red-950/50 pr-4 overflow-hidden flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Messages
            </h2>
          </div>
          <ConversationList conversations={conversations} />
        </div>

        {/* Zone de chat */}
        <div className="md:col-span-2 flex flex-col h-full border rounded-lg border-red-100 dark:border-red-950/50 overflow-hidden bg-white dark:bg-gray-950">
          <ChatHeader
            conversationId={conversationId}
            isGroup={conversation.isGroup}
            name={conversation.name}
            image={conversation.image}
            otherUser={otherMember?.user}
          />
          <MessageList
            conversationId={conversationId}
            initialMessages={messages}
            currentUserId={currentUserId}
          />
          <MessageInput conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;