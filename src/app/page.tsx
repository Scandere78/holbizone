import CreatePost from "@/components/CreatePost";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { getPosts } from "@/actions/post.action";
import PostCard from "@/components/PostCard";

export default async function Home() {
  const { userId } = await auth();
  const posts = await getPosts(); // Assuming you have a function to fetch posts

  // ✅ Convertir les dates en string pour la sérialisation
  const serializedPosts = posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    comments: post.comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    })),
  }));

  console.log({posts});
  
  return (
    <div className="space-y-6">
      {userId ? <CreatePost /> : null}

      <div className="space-y-6">
        {serializedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
