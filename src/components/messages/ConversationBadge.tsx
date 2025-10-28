'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { pusherClient } from '@/lib/pusher';
import { getUnreadCountForConversation } from '@/actions/message.action';

interface ConversationBadgeProps {
  conversationId: string;
}

/**
 * Badge qui affiche le nombre de messages non lus pour une conversation
 */
export default function ConversationBadge({ conversationId }: ConversationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Charger le nombre initial de messages non lus
    getUnreadCountForConversation(conversationId).then(setUnreadCount);

    // S'abonner aux nouveaux messages
    const channel = pusherClient.subscribe(`conversation-${conversationId}`);

    channel.bind('new-message', () => {
      getUnreadCountForConversation(conversationId).then(setUnreadCount);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [conversationId]);

  if (unreadCount === 0) return null;

  return (
    <Badge
      className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full px-1.5 shadow-lg"
      variant="destructive"
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}
