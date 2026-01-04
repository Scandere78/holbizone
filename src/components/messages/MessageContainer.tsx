"use client";

import { useRef } from "react";
import MessageList, { MessageListRef, Message } from "./MessageList";
import MessageInput from "./MessageInput";

interface MessageContainerProps {
  conversationId: string;
  initialMessages: Message[]; // Messages initiaux chargés depuis le serveur
  currentUserId: string; // ID de l'utilisateur connecté
}

/**
 * Conteneur qui connecte MessageList et MessageInput
 *
 * RÔLE IMPORTANT:
 * Ce composant sert de pont entre MessageList et MessageInput.
 * Il crée une ref qui permet à MessageInput d'ajouter des messages
 * directement à MessageList sans passer par le serveur d'abord.
 *
 * ARCHITECTURE:
 *
 *    MessageContainer
 *         │
 *         ├──> MessageList (affiche les messages)
 *         │         ↑
 *         │         │ ref.addOptimisticMessage()
 *         │         │
 *         └──> MessageInput (envoie les messages)
 *
 * FLUX DE DONNÉES:
 * 1. MessageInput envoie un message au serveur
 * 2. MessageInput appelle messageListRef.current.addOptimisticMessage()
 * 3. Le message apparaît IMMÉDIATEMENT dans MessageList
 * 4. Pusher envoie aussi le message (évite les doublons via ID)
 */
export default function MessageContainer({
  conversationId,
  initialMessages,
  currentUserId,
}: MessageContainerProps) {
  // Créer une ref vers MessageList pour permettre les mises à jour optimistes
  const messageListRef = useRef<MessageListRef>(null);

  return (
    <>
      {/* Liste des messages avec ref pour les mises à jour */}
      <MessageList
        ref={messageListRef}
        conversationId={conversationId}
        initialMessages={initialMessages}
        currentUserId={currentUserId}
      />
      {/* Input pour envoyer des messages avec accès à la ref */}
      <MessageInput
        conversationId={conversationId}
        messageListRef={messageListRef}
      />
    </>
  );
}
