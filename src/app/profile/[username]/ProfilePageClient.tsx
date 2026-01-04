"use client";

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import PostCard from "@/components/PostCard";
import FollowersModal from "@/components/modals/FollowersModal";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  CalendarIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import dynamic from 'next/dynamic';

const ProfileActions = dynamic(() => import('@/components/profile/ProfileActions'), {
  ssr: false,
  loading: () => <div className="w-full mt-4 h-10" />,
});

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following';
    count: number;
  }>({
    isOpen: false,
    type: 'followers',
    count: 0,
  });

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  // ✅ Sérialiser les posts
  const serializedPosts = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    }));
  }, [posts]);

  // ✅ Sérialiser les likes posts
  const serializedLikedPosts = useMemo(() => {
    return likedPosts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    }));
  }, [likedPosts]);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditSubmit = async () => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await updateProfile(formData);
      if (result.success) {
        setShowEditDialog(false);
        toast.success("Profil mis à jour avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Ouvrir la modal des abonnés/abonnements
   */
  const openModal = (type: 'followers' | 'following', count: number) => {
    setModalState({
      isOpen: true,
      type,
      count,
    });
  };

  /**
   * Fermer la modal
   */
  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: 'followers',
      count: 0,
    });
  };

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">{user.name ?? user.username}</h1>
                <p className="text-muted-foreground">@{user.username || "user"}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openModal('following', user._count.following)}
                      className="flex flex-col h-auto py-3 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300"
                    >
                      <div className="font-bold text-lg">{user._count.following.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openModal('followers', user._count.followers)}
                      className="flex flex-col h-auto py-3 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300"
                    >
                      <div className="font-bold text-lg">{user._count.followers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </Button>
                    <div className="flex flex-col items-center justify-center border rounded-md py-3">
                      <div className="font-bold text-lg">{user._count.posts.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                <ProfileActions
                  targetUserId={user.id}
                  targetUsername={user.username}
                  isFollowing={initialIsFollowing}
                  onEditClick={() => setShowEditDialog(true)}
                />

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http") ? user.website : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {serializedPosts.length > 0 ? (
                serializedPosts.map((post) => <PostCard key={post.id} post={post}/>)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {serializedLikedPosts.length > 0 ? (
                serializedLikedPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Your personal website"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isUpdating}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleEditSubmit} disabled={isUpdating}>
                {isUpdating ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Followers/Following */}
        <FollowersModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          userId={user.id}
          type={modalState.type}
          initialCount={modalState.count}
        />
      </div>
    </div>
  );
}
export default ProfilePageClient;