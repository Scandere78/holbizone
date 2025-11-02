'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { editComment } from '@/actions/post.action';
import { Loader2 } from 'lucide-react';

/**
 * Modal d'édition de commentaire
 */
interface EditCommentDialogProps {
  isOpen: boolean;
  onCloseAction: () => void; // ✅ Renommé de onClose
  comment: any;
  onSuccess?: () => void;
}

export default function EditCommentDialog({
  isOpen,
  onCloseAction,
  comment,
  onSuccess,
}: EditCommentDialogProps) {
  // ✅ AJOUTER LES STATES
  const [content, setContent] = useState(comment?.content || '');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Calculer les caractères restants
  const remainingChars = 500 - content.length;

  // ✅ Fermer le dialog
  const handleClose = () => {
    setContent(comment?.content || '');
    onCloseAction();
  };

  // ✅ Soumettre l'édition
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return;
    }

    if (content.length > 500) {
      toast.error('Le commentaire ne peut pas dépasser 500 caractères');
      return;
    }

    if (content.trim() === comment?.content?.trim()) {
      toast.success('Aucune modification');
      handleClose();
      return;
    }

    try {
      setIsLoading(true);

      const result = await editComment(comment.id, content.trim());

      if (!result.success) {
        toast.error(result.error || "Erreur lors de l'édition");
        return;
      }

      toast.success('Commentaire édité ! ✅');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Erreur lors de l\'édition');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] border-red-100 dark:border-red-950/50">
        <DialogHeader>
          <DialogTitle className="text-xl">✏️ Éditer le commentaire</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Textarea */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre commentaire..."
              className="min-h-[100px] resize-none border-red-200 dark:border-red-900/50 focus:border-red-500"
              disabled={isLoading}
              maxLength={500}
            />

            {/* Compteur de caractères */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {content.length} / 500 caractères
              </span>
              <span
                className={`font-semibold ${
                  remainingChars < 50
                    ? 'text-orange-500'
                    : remainingChars > 100
                      ? 'text-green-500'
                      : 'text-yellow-500'
                }`}
              >
                {remainingChars} restants
              </span>
            </div>
          </div>

          {/* Footer avec boutons */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-red-200 hover:bg-red-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                '💾 Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}