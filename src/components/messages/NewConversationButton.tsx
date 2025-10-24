"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { getOrCreatePrivateConversation } from "@/actions/message.action";
import { toast } from "react-hot-toast";

interface NewConversationButtonProps {
  userId: string;
}

export default function NewConversationButton({
  userId,
}: NewConversationButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateConversation = async () => {
    setIsLoading(true);
    try {
      const result = await getOrCreatePrivateConversation(userId);

      if (result.success && result.conversation) {
        router.push(`/messages/${result.conversation.id}`);
      } else {
        toast.error("Erreur lors de la création de la conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Erreur lors de la création de la conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreateConversation}
      disabled={isLoading}
      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </>
      )}
    </Button>
  );
}
