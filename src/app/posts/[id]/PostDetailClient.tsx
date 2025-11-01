'use client';

import CommentCard from '@/components/CommentCard';
import { useRouter } from 'next/navigation';

/**
 * Composant client pour afficher les détails d'un post
 */
interface PostDetailClientProps {
  post: any;
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const router = useRouter();

  const handleCommentDeleted = () => {
    // Rafraîchir la page pour voir les changements
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Post */}
      <div className="border border-red-100 rounded-lg p-4">
        <h1 className="font-bold text-2xl mb-4">{post.content}</h1>
        {post.image && (
          <img src={post.image} alt="Post" className="rounded-lg mb-4" />
        )}
      </div>

      {/* Commentaires */}
      <div className="space-y-3">
        <h2 className="font-bold text-xl">Commentaires</h2>
        {post.comments?.length ? (
          post.comments.map((comment: any) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        ) : (
          <p className="text-muted-foreground">Aucun commentaire</p>
        )}
      </div>
    </div>
  );
}
