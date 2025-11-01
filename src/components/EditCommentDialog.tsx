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
import { toast } from 'sonner';
import { editComment } from '@/actions/post.action';
import { Loader2 } from 'lucide-react';

/**
 * Modal d'édition de commentaire
 */
interface EditCommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  comment: {
    id: string;
    content: string;
  };
  onSuccess?: () => void;
}

export default function EditCommentDialog({
  isOpen,
  onClose,
  comment,
  onSuccess,
}: EditCommentDialogProps) {
  const [content, setContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);

  const remainingChars = 500 - content.length;

  const handleClose = () => {
    setContent(comment.content);
    onClose();
  };

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

    if (content.trim() === comment.content.trim()) {
      toast.info('Aucune modification');
      return;
    }

    try {
      setIsLoading(true);

      const result = await editComment(comment.id, content.trim());

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Commentaire édité !');
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>✏️ Éditer le commentaire</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre commentaire..."
              className="min-h-[100px] resize-none border-red-200"
              disabled={isLoading}
              maxLength={500}
            />

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {content.length} / 500 caractères
              </span>
              <span
                className={`font-semibold ${
                  remainingChars < 50 ? 'text-orange-500' : 'text-green-500'
                }`}
              >
                {remainingChars} restants
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
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