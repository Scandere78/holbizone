'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createComment } from '@/actions/post.action';
import CommentCard from '@/components/CommentCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/error-message';
import { MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CommentListProps {
  postId: string;
  comments: any[];
}

export default function CommentList({ postId, comments: initialComments }: CommentListProps) {
  const { user } = useUser();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vous devez être connecté pour commenter');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return;
    }

    if (newComment.length > 500) {
      toast.error('Le commentaire ne peut pas dépasser 500 caractères');
      return;
    }

    try {
      setIsLoading(true);
      const result = await createComment(postId, newComment.trim());

      if (result.success) {
        toast.success('Commentaire ajouté !');
        setNewComment('');
        window.location.reload();
      } else {
        toast.error(result.error || 'Erreur lors de l\'ajout du commentaire');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout de commentaire */}
      {user && (
        <Card className="p-4 border-red-100 dark:border-red-950/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Ajouter un commentaire
          </h3>
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrivez votre commentaire..."
              className="resize-none border-red-200 dark:border-red-900/50"
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {newComment.length} / 500 caractères
              </span>
              <Button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Publier
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des commentaires */}
      <div>
        <h3 className="font-semibold mb-4">
          {comments.length} commentaire{comments.length > 1 ? 's' : ''}
        </h3>

        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MessageCircle className="h-12 w-12" />}
            title="Aucun commentaire"
            description="Soyez le premier à commenter ce post !"
          />
        )}
      </div>
    </div>
  );
}
