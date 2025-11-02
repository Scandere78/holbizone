import { getPostById } from '@/actions/post.action';
import PostCardWrapper from '@/components/PostCardWrapper';
import CommentList from '@/components/CommentList';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostById(params.id);

  if (!post) {
    notFound();
  }

  // ✅ Sérialiser les dates pour le client
  const serializedPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    comments: post.comments.map((comment: any) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Bouton retour */}
      <Link href="/">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </Link>

      {/* Post */}
      <PostCardWrapper 
        post={serializedPost}
      />

      {/* Commentaires */}
      <Card className="p-6 border-red-100 dark:border-red-950/50">
        <CommentList postId={post.id} comments={serializedPost.comments} />
      </Card>
    </div>
  );
}
