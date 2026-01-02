'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OptimizedAvatar } from '@/components/ui/optimized-image';
import { Skeleton } from '@/components/ui/skeleton';
import FollowButton from '@/components/FollowButton';
import Link from 'next/link';
import { getUserFollowers, getUserFollowing } from '@/actions/user.action';
import { Users, UserCheck } from 'lucide-react';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  initialCount: number;
}

export default function FollowersModal({
  isOpen,
  onClose,
  userId,
  type,
  initialCount,
}: FollowersModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data =
        type === 'followers'
          ? await getUserFollowers(userId)
          : await getUserFollowing(userId);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const title = type === 'followers' ? 'Abonnés' : 'Abonnements';
  const Icon = type === 'followers' ? UserCheck : Users;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Icon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="truncate">{title}</span>
            <span className="text-sm text-muted-foreground font-normal shrink-0">
              ({initialCount})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {type === 'followers'
                  ? 'Aucun abonné pour le moment'
                  : 'Aucun abonnement pour le moment'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {users.map((user) => {
                const isFollowing = user.followers && user.followers.length > 0;

                return (
                  <div
                    key={user.id}
                    className="flex items-start gap-3 p-3 sm:p-4 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Link href={`/profile/${user.username}`} onClick={onClose} className="shrink-0">
                      <OptimizedAvatar
                        src={user.image || null}
                        alt={user.name || user.username || 'User'}
                        fallbackText={user.name || user.username || 'User'}
                        size={44}
                        className="ring-2 ring-red-500/20 hover:ring-red-500/50 transition-all cursor-pointer"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 pt-1">
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={onClose}
                        className="block"
                      >
                        <h4 className="font-semibold text-sm sm:text-base hover:text-red-600 dark:hover:text-red-400 transition-colors truncate">
                          {user.name || user.username}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </Link>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 hidden sm:block">
                          {user.bio}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-1">
                      <FollowButton
                        targetUserId={user.id}
                        isFollowing={isFollowing}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
