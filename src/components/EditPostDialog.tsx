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
import { updatePost } from '@/actions/post.action';
import { Loader2 } from 'lucide-react';

interface EditPostDialogProps {
  isOpen: boolean;
  onCloseAction: () => void;
  post: any;
  onSuccess?: () => void;
}

export default function EditPostDialog({
  isOpen,
  onCloseAction,
  post,
  onSuccess,
}: EditPostDialogProps) {
  const [content, setContent] = useState(post?.content || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setContent(post?.content || '');
    onCloseAction();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Le contenu ne peut pas être vide');
      return;
    }

    if (content.trim() === post?.content?.trim()) {
      toast.success('Aucune modification');
      handleClose();
      return;
    }

    try {
      setIsLoading(true);

      const result = await updatePost(post.id, content.trim());

      if (!result.success) {
        toast.error(result.error || "Erreur lors de l'édition");
        return;
      }

      toast.success('Post modifié ! ✅');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error editing post:', error);
      toast.error('Erreur lors de l\'édition');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] border-red-100 dark:border-red-950/50">
        <DialogHeader>
          <DialogTitle className="text-xl">✏️ Modifier le post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              className="min-h-[200px] resize-none border-red-200 dark:border-red-900/50 focus:border-red-500"
              disabled={isLoading}
            />

            <div className="text-sm text-muted-foreground">
              {content.length} caractères
            </div>
          </div>

          {post.image && (
            <div className="relative">
              <img
                src={post.image}
                alt="Post image"
                className="rounded-lg max-h-96 w-full object-cover"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Note: La modification d'images n'est pas encore disponible
              </p>
            </div>
          )}

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
