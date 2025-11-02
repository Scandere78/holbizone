"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

interface FollowButtonProps {
  targetUserId: string; // ✅ L'utilisateur à follow
  isFollowing?: boolean; // ✅ État initial
}

export default function FollowButton({
  targetUserId,
  isFollowing = false,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      if (!targetUserId) throw new Error("User ID is required");

      await toggleFollow(targetUserId);
      setFollowing(!following);
      toast.success(
        following ? "Unfollowed successfully" : "Followed successfully"
      );
    } catch (error) {
      console.error("Follow error:", error);
      toast.error("Error toggling follow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={following ? "outline" : "default"}
      onClick={handleFollow}
      disabled={isLoading}
      className={following ? "border-red-300 text-red-600 hover:bg-red-50" : "bg-red-600 hover:bg-red-700"}
    >
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : following ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
}