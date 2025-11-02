'use client';

import { useRouter } from 'next/navigation';
import PostCard from './PostCard';

interface PostCardWrapperProps {
  post: any;
}

export default function PostCardWrapper({ post }: PostCardWrapperProps) {
  const router = useRouter();

  const handlePostDeleted = () => {
    // Rediriger vers l'accueil après suppression
    router.push('/');
  };

  return (
    <PostCard 
      post={post}
      onPostDeleted={handlePostDeleted}
    />
  );
}
