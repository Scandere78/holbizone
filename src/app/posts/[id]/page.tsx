import PostDetailClient from './PostDetailClient';
import { getPosts } from '@/actions/post.action';

/**
 * Page de détail d'un post avec commentaires
 */
export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // Récupérer le post avec ses commentaires
    const posts = await getPosts();
    const post = posts.find((p) => p.id === params.id);

    if (!post) {
      return <div>Post non trouvé</div>;
    }

    return <PostDetailClient post={post} />;
  } catch (error) {
    console.error('Error loading post:', error);
    return <div>Erreur au chargement du post</div>;
  }
}