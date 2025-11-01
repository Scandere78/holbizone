"use client";

import { createComment, deletePost, getPosts, toggleLike, updatePost } from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

// Type pour les posts sérialisés (dates en string)
type SerializedPost = Omit<Post, 'createdAt' | 'updatedAt' | 'comments'> & {
  createdAt: string;
  updatedAt: string;
  comments: (Omit<Post['comments'][0], 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  })[];
};

// Export le type pour utilisation dans d'autres fichiers
export type { SerializedPost };

function PostCard({ post, dbUserId }: { post: SerializedPost; dbUserId: string | null }) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content ?? "");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [hasLiked, setHasLiked] = useState(dbUserId ? post.likes.some((like) => like.userId === dbUserId) : false);
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptimisticLikes(post._count.likes);
      setHasLiked(dbUserId ? post.likes.some((like) => like.userId === dbUserId) : false);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <Card className="overflow-hidden border-red-100 dark:border-red-950/50 shadow-md hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
              <Avatar className="size-10 sm:w-12 sm:h-12 ring-2 ring-red-200 dark:ring-red-800 transition-transform hover:scale-110 duration-200">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-bold truncate hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`} className="hover:text-red-500 transition-colors">
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span className="text-xs">{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20 -mr-2"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsEditMode(true)}
                        className="text-blue-600 dark:text-blue-400 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-600 dark:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {isEditMode ? (
                <div className="mt-3 space-y-3">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[80px] resize-none bg-muted/30 border-blue-100 dark:border-blue-900 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false);
                        setEditedContent(post.content ?? "");
                      }}
                      disabled={isSavingEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!editedContent.trim()) {
                          toast.error("Post content cannot be empty");
                          return;
                        }
                        setIsSavingEdit(true);
                        try {
                          const result = await updatePost(post.id, editedContent.trim());
                          if (result.success) {
                            toast.success("Post updated successfully");
                            setIsEditMode(false);
                            // Recharger la page pour voir les changements
                            window.location.reload();
                          } else {
                            toast.error(result.error || "Failed to update post");
                          }
                        } catch (error) {
                          toast.error("Failed to update post");
                        } finally {
                          setIsSavingEdit(false);
                        }
                      }}
                      disabled={isSavingEdit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSavingEdit ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm sm:text-base text-foreground break-words leading-relaxed">{post.content}</p>
              )}
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-xl overflow-hidden border-2 border-red-100 dark:border-red-900 group-hover:border-red-200 dark:group-hover:border-red-800 transition-colors">
              <img src={post.image} alt="Post content" className="w-full h-auto object-cover transition-transform group-hover:scale-[1.02] duration-300" />
            </div>
          )}

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-4 border-t border-red-100 dark:border-red-950/50">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 transition-all duration-200 ${
                  hasLiked 
                    ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current animate-pulse" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span className="font-semibold">{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                  <HeartIcon className="size-5" />
                  <span className="font-semibold">{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 transition-all duration-200 ${showComments ? "fill-blue-500 text-blue-500 rotate-12" : ""}`}
              />
              <span className="font-semibold">{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t border-red-100 dark:border-red-950/50 animate-in slide-in-from-top duration-300">
              <div className="space-y-3">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors">
                    <Avatar className="size-8 flex-shrink-0 ring-1 ring-red-200 dark:ring-red-800">
                      <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-sm hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                          @{comment.author.username}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm break-words mt-1 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3 pt-3">
                  <Avatar className="size-9 flex-shrink-0 ring-2 ring-red-200 dark:ring-red-800">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Ajoute un commentaire... 💬"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none bg-muted/30 border-red-100 dark:border-red-900 focus:border-red-500 dark:focus:border-red-500 transition-colors"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Publication..."
                        ) : (
                          <>
                            <SendIcon className="size-4 mr-1" />
                            Commenter
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-6 border-2 border-dashed border-red-200 dark:border-red-800 rounded-lg bg-red-50/30 dark:bg-red-950/10">
                  <SignInButton mode="modal">
                    <Button className="gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                      <LogInIcon className="size-4" />
                      Se connecter pour commenter
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Delete confirmation dialog */}
    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post and all its comments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeletePost}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
export default PostCard;