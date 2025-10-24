"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  conversationId: string;
  isGroup: boolean;
  name?: string | null;
  image?: string | null;
  otherUser?: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

export default function ChatHeader({
  conversationId,
  isGroup,
  name,
  image,
  otherUser,
}: ChatHeaderProps) {
  const router = useRouter();

  const displayName = isGroup
    ? name
    : otherUser?.name || otherUser?.username || "Utilisateur";
  const displayImage = isGroup ? image : otherUser?.image;

  return (
    <div className="border-b bg-background px-4 py-3 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/messages")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Avatar className="h-10 w-10">
        <AvatarImage src={displayImage || ""} />
        <AvatarFallback>{displayName?.[0] || "?"}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h2 className="font-semibold">{displayName}</h2>
        {!isGroup && otherUser?.username && (
          <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
        )}
      </div>

      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
}
