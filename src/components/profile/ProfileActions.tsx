'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignInButton, useUser } from '@clerk/nextjs';
import { EditIcon, MoreVertical, ShieldOff } from 'lucide-react';
import { toggleFollow } from '@/actions/user.action';
import { blockUser } from '@/actions/block.actions';
import toast from 'react-hot-toast';

interface ProfileActionsProps {
  targetUserId: string;
  targetUsername: string;
  isFollowing: boolean;
  onEditClick: () => void;
}

export default function ProfileActions({
  targetUserId,
  targetUsername,
  isFollowing: initialIsFollowing,
  onEditClick,
}: ProfileActionsProps) {
  const { user: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  const isOwnProfile =
    currentUser?.username === targetUsername ||
    currentUser?.emailAddresses[0].emailAddress.split('@')[0] === targetUsername;

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(targetUserId);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handleBlock = async () => {
    if (!currentUser) return;

    try {
      setIsBlockLoading(true);
      const result = await blockUser(targetUserId);

      if (result.success) {
        setIsBlocked(true);
        toast.success('Utilisateur bloqué');
      } else {
        toast.error(result.error || 'Erreur lors du blocage');
      }
    } catch (error) {
      toast.error('Erreur lors du blocage');
    } finally {
      setIsBlockLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <SignInButton mode="modal">
        <Button className="w-full mt-4">Follow</Button>
      </SignInButton>
    );
  }

  if (isOwnProfile) {
    return (
      <Button className="w-full mt-4" onClick={onEditClick}>
        <EditIcon className="size-4 mr-2" />
        Edit Profile
      </Button>
    );
  }

  return (
    <div className="w-full mt-4 flex gap-2">
      <Button
        className="flex-1"
        onClick={handleFollow}
        disabled={isUpdatingFollow || isBlocked}
        variant={isFollowing ? 'outline' : 'default'}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!isBlocked && (
            <DropdownMenuItem
              onClick={handleBlock}
              disabled={isBlockLoading}
              className="text-red-600 cursor-pointer flex items-center gap-2"
            >
              <ShieldOff className="w-4 h-4" />
              {isBlockLoading ? 'Blocage...' : "Bloquer l'utilisateur"}
            </DropdownMenuItem>
          )}
          {isBlocked && (
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <ShieldOff className="w-4 h-4" />
              Utilisateur bloqué
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
