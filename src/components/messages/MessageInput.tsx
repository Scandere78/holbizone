"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/actions/message.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, SendHorizontal } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() && !image) return;

    setIsSending(true);
    try {
      const result = await sendMessage({
        conversationId,
        content: content.trim(),
        image: image || undefined,
      });

      if (result.success) {
        setContent("");
        setImage(null);
        router.refresh();
      } else {
        toast.error("Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
