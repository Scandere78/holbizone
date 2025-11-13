'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Trash2,
  Edit2,
  ShieldOff,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import {
  toggleLike,
  deletePost,
  updatePost,
} from '@/actions/post.action';
import {
  toggleBookmark,
  isPostBookmarked,
} from '@/actions/bookmark.action';
import { blockUser, isUserBlocked } from '@/actions/block.actions';
import { useUser } from '@clerk/nextjs';
import EditPostDialog from './EditPostDialog';
import { DeleteAlertDialog } from './DeleteAlertDialog';

interface PostCardProps {
  post: any;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export default function PostCard({
  post,
  onPostDeleted,
  onPostUpdated,
}: PostCardProps) {
  const { user: clerkUser } = useUser();
  const router = useRouter();

  // États
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  // Vérifier si l'utilisateur actuel est l'auteur
  const isAuthor = clerkUser?.id === post.author.clerkId;

  // ✅ Vérifier si le post est liké au chargement
  useEffect(() => {
    const checkLike = async () => {
      if (!clerkUser?.id || !post.likes || !Array.isArray(post.likes)) {
        return;
      }

      // Importer getUserByClerkId pour obtenir l'ID de la DB
      const { getUserByClerkId } = await import('@/actions/user.action');
      const currentDbUser = await getUserByClerkId(clerkUser.id);

      if (currentDbUser) {
        const liked = post.likes.some((like: any) => like.userId === currentDbUser.id);
        setIsLiked(liked);
      }
    };
    checkLike();
  }, [post.likes, clerkUser?.id]);

  // ✅ Vérifier si le post est bookmarké au chargement
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const bookmarked = await isPostBookmarked(post.id);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Error checking bookmark:', error);
      }
    };
    checkBookmark();
  }, [post.id]);

  // ✅ Vérifier si l'auteur est bloqué au chargement
  useEffect(() => {
    const checkBlocked = async () => {
      if (post.author.id && !isAuthor) {
        try {
          const blocked = await isUserBlocked(post.author.id);
          setIsBlocked(blocked);
        } catch (error) {
          console.error('Error checking blocked status:', error);
        }
      }
    };
    checkBlocked();
  }, [post.author.id, isAuthor]);

  // ✅ Handler Like
  const handleLike = async () => {
    // Prevent multiple clicks while loading
    if (isLoadingLike) return;

    try {
      setIsLoadingLike(true);
      const newLikedState = !isLiked;
      const previousLikeCount = likeCount;
      const previousLikedState = isLiked;

      // Optimistic update
      setIsLiked(newLikedState);
      setLikeCount(newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1));

      const result = await toggleLike(post.id);

      if (result.success) {
        toast.success(
          newLikedState ? '❤️ Post aimé !' : '💔 J\'aime retiré'
        );
      } else {
        // Revert state on error
        setIsLiked(previousLikedState);
        setLikeCount(previousLikeCount);
        toast.error(result.error || 'Erreur lors du like');
      }
    } catch (error) {
      // Revert state on error
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
      toast.error('Erreur lors du like');
    } finally {
      setIsLoadingLike(false);
    }
  };

  // ✅ Handler Bookmark
  const handleBookmark = async () => {
    try {
      setIsLoadingBookmark(true);
      const result = await toggleBookmark(post.id);

      if (result.success) {
        setIsBookmarked(result.bookmarked || false);
        toast.success(
          result.bookmarked ? '📌 Post sauvegardé!' : 'Bookmark retiré'
        );
      } else {
        toast.error(result.error || 'Erreur');
      }
    } catch (error) {
      toast.error('Erreur lors du bookmark');
    } finally {
      setIsLoadingBookmark(false);
    }
  };

  // ✅ Handler Delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);

      if (result.success) {
        toast.success('✅ Post supprimé');
        onPostDeleted?.();
        router.refresh();
      } else {
        toast.error(result.error || 'Erreur');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Handler Share
  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      toast.success('🔗 Lien copié !');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  // ✅ Handler Block
  const handleBlock = async () => {
    try {
      setIsBlockLoading(true);
      const result = await blockUser(post.author.id);

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

  return (
    <>
      <Card className="p-6 border-red-100 dark:border-red-950/50 hover:shadow-lg transition-shadow">
        {/* ===== HEADER ===== */}
        <div className="flex items-start justify-between mb-4">
          {/* Auteur Info */}
          <Link href={`/profile/${post.author.username}`} className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-red-500/20 hover:ring-red-500/50 transition-all">
              <AvatarImage src={post.author.image || ''} />
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold">
                {post.author.name?.[0]?.toUpperCase() || post.author.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm hover:text-red-600 dark:hover:text-red-400 transition-colors truncate">
                  {post.author.name || post.author.username}
                </h3>
                {post.author.verified && (
                  <span className="text-blue-500">✓</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                @{post.author.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            </div>
          </Link>

          {/* Menu Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Option Edit (si auteur) */}
              {isAuthor && (
                <DropdownMenuItem
                  onClick={() => setIsEditOpen(true)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Éditer
                </DropdownMenuItem>
              )}

              {/* Option Delete (si auteur) */}
              {isAuthor && (
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="cursor-pointer flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </DropdownMenuItem>
              )}

              {/* Partager */}
              <DropdownMenuItem
                onClick={handleShare}
                className="cursor-pointer flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </DropdownMenuItem>

              {/* Option Bloquer (si pas auteur et pas déjà bloqué) */}
              {!isAuthor && clerkUser && (
                <>
                  {!isBlocked ? (
                    <DropdownMenuItem
                      onClick={handleBlock}
                      disabled={isBlockLoading}
                      className="text-red-600 cursor-pointer flex items-center gap-2"
                    >
                      <ShieldOff className="w-4 h-4" />
                      {isBlockLoading ? 'Blocage...' : 'Bloquer l\'utilisateur'}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      disabled
                      className="flex items-center gap-2"
                    >
                      <ShieldOff className="w-4 h-4" />
                      Utilisateur bloqué
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ===== CONTENU ===== */}
        <div className="mb-4">
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

        {/* ===== IMAGE ===== */}
        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt="Post image"
              className="w-full h-auto max-h-96 object-cover hover:opacity-90 transition-opacity"
            />
          </div>
        )}

        {/* ===== STATS ===== */}
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground border-t border-b border-red-100 dark:border-red-950/50 py-3">
          <span className="font-medium">
            {likeCount > 0 ? `${likeCount} ${likeCount === 1 ? 'J\'aime' : 'J\'aime'}` : '0 J\'aime'}
          </span>
          <span className="font-medium">
            {post._count?.comments > 0 ? `${post._count.comments} ${post._count.comments === 1 ? 'Commentaire' : 'Commentaires'}` : '0 Commentaire'}
          </span>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLoadingLike}
            className={`flex items-center justify-center gap-1 sm:gap-2 flex-1 px-2 sm:px-3 py-2 rounded-lg transition-all ${
              isLiked
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600'
            }`}
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isLiked ? 'fill-current' : ''}`}
            />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              {isLiked ? 'Aimé' : 'J\'aime'}
            </span>
          </button>

          {/* Comment Button */}
          <Link
            href={`/post/${post.id}`}
            className="flex items-center justify-center gap-1 sm:gap-2 flex-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 transition-all"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Commenter</span>
          </Link>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={isLoadingBookmark}
            className={`flex items-center justify-center gap-1 sm:gap-2 flex-1 px-2 sm:px-3 py-2 rounded-lg transition-all ${
              isBookmarked
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isBookmarked ? 'fill-current' : ''}`}
            />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              {isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1 sm:gap-2 flex-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 transition-all"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Partager</span>
          </button>
        </div>
      </Card>

      {/* Delete Confirm Dialog - Simple implementation */}
      <EditPostDialog
        isOpen={isEditOpen}
        onCloseAction={() => setIsEditOpen(false)}
        post={post}
        onSuccess={() => {
          setIsEditOpen(false);
          onPostUpdated?.();
          router.refresh();
        }}
      />

      <DeleteAlertDialog
        isDeleting={isDeleting}
        isOpen={isDeleteDialogOpen}
        onDeleteAction={handleDelete}
        onCloseAction={() => setIsDeleteDialogOpen(false)}
        title="Supprimer le post ?"
        description="Cette action est irréversible. Le post sera définitivement supprimé."
      />
    </>
  );
}