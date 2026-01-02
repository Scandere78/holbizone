import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { notFound } from "next/navigation";
import dynamic from 'next/dynamic';

const ProfilePageClient = dynamic(() => import('./ProfilePageClient'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
    </div>
  ),
});

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return null;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}
export default ProfilePageServer;