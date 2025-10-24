"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ConversationListProps {
  conversations: any[];
}

function ConversationList({ conversations }: ConversationListProps) {
  const pathname = usePathname();

  const getConversationName = (conversation: any) => {
    if (conversation.isGroup) {
      return conversation.name || "Groupe sans nom";
    }

    // Pour une conversation privée, afficher l'autre utilisateur
    const otherMember = conversation.members.find(
      (m: any) => m.user.id !== conversation.members[0]?.user.id
    );
    return otherMember?.user.name || otherMember?.user.username || "Utilisateur";
  };

  const getConversationImage = (conversation: any) => {
    if (conversation.isGroup) {
      return conversation.image || null;
    }

    const otherMember = conversation.members.find(
      (m: any) => m.user.id !== conversation.members[0]?.user.id
    );
    return otherMember?.user.image || null;
  };

  return (
    <div className="space-y-2 overflow-y-auto flex-1">
      {conversations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune conversation</p>
          <p className="text-sm mt-2">Commencez une nouvelle conversation !</p>
        </div>
      ) : (
        conversations.map((conversation) => {
          const isActive = pathname === `/messages/${conversation.id}`;
          const lastMessage = conversation.messages[0];

          return (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className={`block p-3 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-l-4 border-red-600 shadow-md"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-red-500/20">
                    <AvatarImage src={getConversationImage(conversation) || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold">
                      {getConversationName(conversation)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {getConversationName(conversation)}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    )}
                  </div>

                  {lastMessage ? (
                    <p className="text-sm text-muted-foreground truncate">
                      <span className="font-medium">{lastMessage.sender.username}:</span> {lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Aucun message
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

export default ConversationList;