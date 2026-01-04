"use client";

import { useState } from "react";
import { sendMessage } from "@/actions/message.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, SendHorizontal } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { MessageListRef } from "./MessageList";

interface MessageInputProps {
  conversationId: string;
  messageListRef: React.RefObject<MessageListRef>; // Référence vers MessageList pour les mises à jour optimistes
}

/**
 * Composant pour envoyer des messages
 *
 * IMPORTANT: Ce composant utilise des mises à jour optimistes pour afficher
 * les messages instantanément sans attendre le serveur.
 *
 * Fonctionnement:
 * 1. L'utilisateur tape un message et clique sur Envoyer
 * 2. Le message est effacé de l'input IMMÉDIATEMENT (meilleure UX)
 * 3. Le message est envoyé au serveur
 * 4. Si succès: le message est ajouté à la liste via addOptimisticMessage
 * 5. Si échec: le message est restauré dans l'input pour réessayer
 */
export default function MessageInput({ conversationId, messageListRef }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    // Validation: au moins du texte ou une image
    if (!content.trim() && !image) return;

    // Sauvegarder les valeurs avant de les effacer
    const messageContent = content.trim();
    const messageImage = image;

    // ✅ Effacer l'input IMMÉDIATEMENT pour une meilleure UX
    // L'utilisateur voit que son message est en cours d'envoi
    setContent("");
    setImage(null);
    setIsSending(true);

    try {
      // Envoyer le message au serveur
      // IMPORTANT: L'autorisation est vérifiée côté serveur (pas besoin de useUser ici)
      const result = await sendMessage({
        conversationId,
        content: messageContent,
        image: messageImage || undefined,
      });

      if (result.success && result.message) {
        // ✅ MISE À JOUR OPTIMISTE: Ajouter le message à la liste IMMÉDIATEMENT
        // Le message apparaît instantanément sans attendre de refresh
        // Pusher va aussi envoyer le message, mais on évite les doublons avec la vérification par ID
        messageListRef.current?.addOptimisticMessage(result.message);
      } else {
        // ❌ Échec: Restaurer le contenu pour que l'utilisateur puisse réessayer
        setContent(messageContent);
        setImage(messageImage);
        toast.error(result.error || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // ❌ Erreur: Restaurer le contenu pour que l'utilisateur puisse réessayer
      setContent(messageContent);
      setImage(messageImage);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      {image && (
        <div className="mb-2 relative inline-block">
          <Image
            src={image}
            alt="Upload preview"
            width={100}
            height={100}
            className="rounded-lg object-cover"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => setImage(null)}
          >
            ✕
          </Button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <UploadButton
          endpoint="postImage"
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              setImage(res[0].url);
              setIsUploading(false);
            }
          }}
          onUploadError={(error: Error) => {
            toast.error(`Erreur: ${error.message}`);
            setIsUploading(false);
          }}
          onUploadBegin={() => setIsUploading(true)}
          appearance={{
            button:
              "ut-ready:bg-transparent ut-ready:text-foreground ut-uploading:cursor-not-allowed ut-uploading:bg-primary/50 after:bg-primary",
            allowedContent: "hidden",
          }}
          content={{
            button({ ready }) {
              if (ready)
                return (
                  <ImageIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                );
              return <ImageIcon className="h-5 w-5 animate-pulse" />;
            },
          }}
        />

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez un message..."
          className="resize-none min-h-[40px] max-h-[80px] sm:max-h-[120px]"
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={(!content.trim() && !image) || isSending || isUploading}
          size="icon"
          className="shrink-0"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
