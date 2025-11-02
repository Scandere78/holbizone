'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OptimizedAvatar } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger } from '@/lib/logger';
import { Suspense } from 'react';
import ConversationBadge from './ConversationBadge';

interface ConversationListProps {
  conversations: any[];
  currentUserId: string;
}

/**
 * Wrapper pour le badge avec Suspense
 */
function ConversationBadgeWrapper({ conversationId }: { conversationId: string }) {
  return (
    <Suspense fallback={null}>
      <ConversationBadge conversationId={conversationId} />
    </Suspense>
  );
}

/**
 * Liste des conversations avec recherche et badges
 */
export default function ConversationList({
  conversations,
  currentUserId,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  // Filtrer les conversations par recherche
  const filteredConversations = conversations.filter((conv) => {
    // Trouver l'autre utilisateur (pas l'utilisateur connecté)
    const otherUser = conv.members
      .map((m: any) => m.user)
      .find((u: any) => u.id !== currentUserId);

    const displayName = conv.isGroup ? conv.name : otherUser?.name || otherUser?.username;
    return displayName?.toLowerCase().includes(search.toLowerCase());
  });

  logger.debug({
    context: 'ConversationList',
    action: 'Rendering conversation list',
    details: {
      total: conversations.length,
      filtered: filteredConversations.length,
      currentUserId,
    },
  });

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Barre de recherche */}
      <Input
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-10 rounded-full border-red-200 dark:border-red-900/50 focus:ring-red-600"
      />

      {/* Liste des conversations */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm text-muted-foreground">
                {search ? 'Aucune conversation trouvée' : 'Aucune conversation'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              // Récupérer l'autre utilisateur (pas vous!)
              const otherUser = conversation.members
                .map((m: any) => m.user)
                .find((u: any) => u.id !== currentUserId);

              // Affichage du nom de l'autre utilisateur
              const displayName = conversation.isGroup
                ? conversation.name
                : otherUser?.name || otherUser?.username;

              // Image de l'autre utilisateur
              const displayImage = conversation.isGroup
                ? conversation.image
                : otherUser?.image;

              const lastMessage = conversation.messages?.[0];

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900 group relative"
                >
                  {/* Avatar avec badge */}
                  <div className="relative shrink-0">
                    <OptimizedAvatar
                      src={displayImage || null}
                      alt={displayName || 'Conversation'}
                      fallbackText={displayName || 'Conversation'}
                      size={48}
                      className="ring-2 ring-red-200 dark:ring-red-800 group-hover:ring-red-400 dark:group-hover:ring-red-600 transition-all"
                    />

                    {/* Badge des messages non lus */}
                    <div className="absolute inset-0">
                      <ConversationBadgeWrapper
                        conversationId={conversation.id}
                      />
                    </div>
                  </div>

                  {/* Infos conversation */}
                  <div className="flex-1 min-w-0">
                    {/* Nom */}
                    <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {displayName}
                    </h3>

                    {/* Dernier message */}
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMessage
                        ? `${lastMessage.sender.username}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}`
                        : 'Pas de message'}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
