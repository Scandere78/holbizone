'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { deleteComment } from '@/actions/post.action';
import EditCommentDialog from './EditCommentDialog';
import { OptimizedAvatar } from '@/components/ui/optimized-image';

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

  // ✅ Vérifier si l'utilisateur est l'auteur
  const isAuthor = clerkUser?.id === comment.author.clerkId;

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