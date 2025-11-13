"use client";

import { useEffect, useRef, useState } from "react";
import { getPusherClient } from "@/lib/pusher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

interface Message {
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
  initialMessages: Message[];
  currentUserId: string;
}

export default function MessageList({
  conversationId,
  initialMessages,
  currentUserId,
}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // WebSocket - Écouter les nouveaux messages
  useEffect(() => {
    let channel: any = null;

    getPusherClient().then((pusher) => {
      if (!pusher) return;

      channel = pusher.subscribe(`conversation-${conversationId}`);

      channel.bind("new-message", (newMessage: Message) => {
        // Éviter les doublons
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      });
    });

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
}
