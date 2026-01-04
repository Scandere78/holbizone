"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { getPusherClient } from "@/lib/pusher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

// Type pour un message
export interface Message {
  id: string;
  content: string;
  image?: string | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface MessageListProps {
  conversationId: string;
  initialMessages: Message[]; // Messages chargés depuis le serveur au début
  currentUserId: string;
}

// Interface exposée via ref pour permettre à MessageInput d'ajouter des messages
export interface MessageListRef {
  addOptimisticMessage: (message: Message) => void;
}

/**
 * Composant qui affiche la liste des messages
 *
 * ARCHITECTURE IMPORTANTE:
 * - Utilise forwardRef pour exposer addOptimisticMessage à MessageInput
 * - Écoute les nouveaux messages via Pusher (WebSocket) pour les mises à jour en temps réel
 * - Évite les doublons en vérifiant les IDs avant d'ajouter un message
 * - Auto-scroll vers le bas quand un nouveau message arrive
 */
const MessageList = forwardRef<MessageListRef, MessageListProps>(({
  conversationId,
  initialMessages,
  currentUserId,
}, ref) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Exposer la méthode addOptimisticMessage via ref
  // Permet à MessageInput d'ajouter un message instantanément à la liste
  useImperativeHandle(ref, () => ({
    addOptimisticMessage: (message: Message) => {
      setMessages((prev) => {
        // Vérifier si le message existe déjà (éviter les doublons)
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) return prev;
        // Ajouter le nouveau message à la fin
        return [...prev, message];
      });
    },
  }));

  // ✅ Auto-scroll vers le bas quand un nouveau message arrive
  // S'exécute à chaque fois que la liste de messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ WebSocket - Écouter les nouveaux messages en temps réel via Pusher
  // Permet de recevoir les messages des autres utilisateurs instantanément
  useEffect(() => {
    let channel: any = null;

    // Initialiser le client Pusher (peut être null si pas configuré)
    getPusherClient().then((pusher) => {
      if (!pusher) return; // Pusher n'est pas configuré, skip

      // S'abonner au canal de cette conversation
      channel = pusher.subscribe(`conversation-${conversationId}`);

      // Écouter l'événement "new-message"
      channel.bind("new-message", (newMessage: Message) => {
        // Ajouter le message à la liste en évitant les doublons
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev; // Message déjà dans la liste
          return [...prev, newMessage];
        });
      });
    });

    // Cleanup: se désabonner quand le composant est démonté
    return () => {
      if (channel) {
        channel.unbind("new-message");
        channel.unsubscribe();
      }
    };
  }, [conversationId]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
          <div className="text-6xl">👋</div>
          <h3 className="text-lg font-semibold">
            Début de votre conversation
          </h3>
          <p className="text-muted-foreground">
            Dites coucou à votre ami pour commencer la discussion !
          </p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwn = message.sender.id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.image || ""} />
                  <AvatarFallback>
                    {message.sender.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                {!isOwn && (
                  <span className="text-xs font-medium mb-1">
                    {message.sender.name || message.sender.username}
                  </span>
                )}

                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${
                    isOwn
                      ? "bg-blue-500 text-white"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.image && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <Image
                        src={message.image}
                        alt="Message image"
                        width={300}
                        height={200}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                <span className="text-xs text-muted-foreground mt-1">
                  {format(new Date(message.createdAt), "HH:mm", { locale: fr })}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
});

MessageList.displayName = "MessageList";

export default MessageList;
