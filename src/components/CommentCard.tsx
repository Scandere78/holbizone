'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // ⬅️ AJOUTER CETTE IMPORT
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { deleteComment } from '@/actions/post.action';
import EditCommentDialog from './EditCommentDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage
            src={comment.author.image || '/avatar.png'}
            alt={comment.author.username}
          />
          <AvatarFallback>{comment.author.username?.charAt(0)}</AvatarFallback>
        </Avatar>

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
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🗑️ Supprimer le commentaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}