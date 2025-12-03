'use client';

import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2, Heart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { deleteComment, toggleCommentLike } from '@/actions/post.action';
import EditCommentDialog from './EditCommentDialog';
import { OptimizedAvatar } from '@/components/ui/optimized-image';
import Image from 'next/image';

/**
 * Carte de commentaire avec options d'édition/suppression
 */
interface CommentCardProps {
  comment: any; // Type Prisma comment
  onCommentDeleted?: () => void;
}

export default function CommentCard({
  comment,
  onCommentDeleted,
}: CommentCardProps) {
  const { user: clerkUser } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // États pour les likes
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment._count?.likes || 0);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  // ✅ Vérifier si l'utilisateur est l'auteur
  const isAuthor = clerkUser?.id === comment.author.clerkId;

  // ✅ Vérifier si le commentaire est liké au chargement
  useEffect(() => {
    const checkLike = async () => {
      if (!clerkUser?.id || !comment.likes || !Array.isArray(comment.likes)) {
        return;
      }

      // Importer getUserByClerkId pour obtenir l'ID de la DB
      const { getUserByClerkId } = await import('@/actions/user.action');
      const currentDbUser = await getUserByClerkId(clerkUser.id);

      if (currentDbUser) {
        const liked = comment.likes.some((like: any) => like.userId === currentDbUser.id);
        setIsLiked(liked);
      }
    };
    checkLike();
  }, [comment.likes, clerkUser?.id]);

  /**
   * Gérer le like
   */
  const handleLike = async () => {
    // Prevent multiple clicks while loading
    if (isLoadingLike) return;

    try {
      setIsLoadingLike(true);
      const newLikedState = !isLiked;
      const previousLikeCount = likeCount;

      // Optimistic update
      setIsLiked(newLikedState);
      setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);

      const result = await toggleCommentLike(comment.id);

      if (result.success) {
        toast.success(
          newLikedState ? '❤️ Commentaire aimé!' : 'Like retiré'
        );
      } else {
        // Revert state on error
        setIsLiked(!newLikedState);
        setLikeCount(previousLikeCount);
        toast.error(result.error || 'Erreur');
      }
    } catch (error) {
      // Revert state on error
      const previousState = !isLiked;
      setIsLiked(previousState);
      setLikeCount(previousState ? likeCount - 1 : likeCount + 1);
      toast.error('Erreur lors du like');
    } finally {
      setIsLoadingLike(false);
    }
  };

  /**
   * Gérer la suppression
   */
  const handleDeleteComment = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteComment(comment.id);

      if (!result.success) {
        toast.error(result.error || "Erreur lors de la suppression");
        return;
      }

      toast.success('Commentaire supprimé');
      setIsDeleteConfirmOpen(false);
      onCommentDeleted?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Carte du commentaire */}
      <div className="flex gap-3 p-3 border border-red-100 dark:border-red-950/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
        {/* Avatar */}
        <OptimizedAvatar
          src={comment.author.image || null}
          alt={comment.author.username || 'User'}
          fallbackText={comment.author.username || 'User'}
          size={32}
          className="shrink-0"
        />

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* En-tête */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{comment.author.name}</p>
              <p className="text-xs text-muted-foreground">
                @{comment.author.username}
              </p>
            </div>

            {/* Menu dropdown (seulement pour l'auteur) */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {/* Éditer */}
                  <DropdownMenuItem
                    onClick={() => setIsEditDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 mr-2 text-blue-600" />
                    Éditer
                  </DropdownMenuItem>

                  {/* ✅ Utiliser le vrai composant Separator */}
                  <DropdownMenuSeparator />

                  {/* Supprimer */}
                  <DropdownMenuItem
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="cursor-pointer text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Contenu du commentaire */}
          <p className="text-sm mt-2">{comment.content}</p>

          {/* Image du commentaire */}
          {comment.image && (
            <div className="mt-3 rounded-lg overflow-hidden border border-red-200 dark:border-red-800 bg-gray-100 dark:bg-gray-800">
              <div className="relative w-full max-w-md h-auto min-h-[200px] max-h-[500px]">
                <img
                  src={comment.image}
                  alt="Image du commentaire"
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Bouton de like */}
          <div className="mt-2">
            <button
              onClick={handleLike}
              disabled={isLoadingLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart
                className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`}
              />
              <span>{likeCount > 0 && likeCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <EditCommentDialog
        isOpen={isEditDialogOpen}
        onCloseAction={() => setIsEditDialogOpen(false)}
        comment={comment}
        onSuccess={() => window.location.reload()}
      />

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Supprimer le commentaire ?"
        description="Cette action est irréversible."
        confirmText="Supprimer"
        variant="destructive"
        onConfirm={handleDeleteComment}
        isLoading={isDeleting}
      />
    </>
  );
}