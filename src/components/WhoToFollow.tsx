import { getRandomUsers, getDbUserId } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import FollowButton from "./FollowButton";
import { Users, Sparkles } from "lucide-react";
import { Separator } from "./ui/separator";
import prisma from "@/lib/prisma";

async function WhoToFollow() {
  const users = await getRandomUsers();

  if (!users || users.length === 0) return null;

  // Récupérer l'utilisateur actuel
  const currentUserId = await getDbUserId();

  // Si l'utilisateur est connecté, vérifier qui il suit déjà
  let followedUserIds: string[] = [];
  if (currentUserId) {
    const follows = await prisma.follows.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    followedUserIds = follows.map(f => f.followingId);
  }

  return (
    <div className="sticky top-20">
      <Card className="border-red-100 dark:border-red-950/50 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Header avec gradient */}
        <CardHeader className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-pink-500/10 dark:from-red-950/30 dark:via-orange-950/30 dark:to-pink-950/30 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Qui suivre
            </CardTitle>
            <Sparkles className="h-4 w-4 text-orange-500 animate-pulse ml-auto" />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-3">
            {users.map((user, index) => (
              <div key={user.id}>
                <div className="flex gap-3 items-center justify-between p-2 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                      <Avatar className="w-11 h-11 ring-2 ring-red-200 dark:ring-red-800 transition-transform group-hover:scale-110 duration-200">
                        <AvatarImage src={user.image ?? "/avatar.png"} />
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold">
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="text-sm min-w-0 flex-1">
                      <Link 
                        href={`/profile/${user.username}`} 
                        className="font-semibold hover:text-red-600 dark:hover:text-red-400 transition-colors block truncate"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {user._count.followers} abonné{user._count.followers > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <FollowButton
                    targetUserId={user.id}
                    isFollowing={followedUserIds.includes(user.id)}
                  />
                </div>
                {index < users.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-950/50">
            <Link 
              href="/explore" 
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center justify-center gap-2 hover:underline transition-all"
            >
              Voir plus de suggestions
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default WhoToFollow;