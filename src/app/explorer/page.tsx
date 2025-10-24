import { getAllUsers } from "@/actions/user.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function ExplorerPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Explorer
          </h1>
          <p className="text-muted-foreground">
            Découvrez tous les membres de la communauté
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => {
            const isFollowing = user.followers && user.followers.length > 0;

            return (
              <Card
                key={user.id}
                className="p-4 hover:shadow-lg transition-all border-red-100 dark:border-red-950/50"
              >
                <div className="flex items-start gap-4">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar className="h-16 w-16 ring-2 ring-red-500/20 cursor-pointer hover:ring-red-500/50 transition-all">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold text-lg">
                        {user.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${user.username}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-lg truncate">
                        {user.name}
                      </h3>
                    </Link>
                    {user.username && (
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    )}

                    {user.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>
                        <strong className="text-foreground">
                          {user._count.posts}
                        </strong>{" "}
                        posts
                      </span>
                      <span>
                        <strong className="text-foreground">
                          {user._count.followers}
                        </strong>{" "}
                        followers
                      </span>
                      <span>
                        <strong className="text-foreground">
                          {user._count.following}
                        </strong>{" "}
                        following
                      </span>
                    </div>
                  </div>

                  <FollowButton
                    targetUserId={user.id}
                    isFollowing={isFollowing}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
