import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import { getUserByClerkId } from '@/actions/user.action'
import { LinkIcon, MapPinIcon } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar' // ← Changé ici
import { Separator } from './ui/separator' // ← Changé ici
import Link from 'next/link'

async function Sidebar() {
  const authUser = await currentUser()
  if (!authUser) return <UnAuthenticatedSidebar/>

  const user = await getUserByClerkId(authUser.id)
  if(!user) return null;

  return (
    <div className="sticky top-20 space-y-4">
      <Card className="overflow-hidden border-red-100 dark:border-red-950/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="h-20 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 dark:from-red-900 dark:via-orange-900 dark:to-pink-900" />
        <CardContent className="pt-6 -mt-10">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${user.username}`}
              className="flex flex-col items-center justify-center group"
            >
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-background shadow-xl ring-2 ring-red-200 dark:ring-red-800 transition-transform group-hover:scale-105 duration-300">
                  <AvatarImage src={user.image || "/avatar.png"} alt={user.name ?? undefined} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-background rounded-full" />
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="font-bold text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{user.name}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </Link>

            {user.bio && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{user.bio}</p>
            )}

            <div className="w-full mt-4">
              <Separator className="mb-4" />
              <div className="flex justify-around gap-4">
                <Link href={`/profile/${user.username}`} className="flex-1 group hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition-colors">
                  <p className="font-bold text-lg text-red-600 dark:text-red-400">{user._count.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </Link>
                <Separator orientation="vertical" className="h-auto" />
                <Link href={`/profile/${user.username}`} className="flex-1 group hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition-colors">
                  <p className="font-bold text-lg text-red-600 dark:text-red-400">{user._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </Link>
              </div>
              <Separator className="mt-4 mb-4" />
            </div>

            <div className="w-full space-y-3 text-sm">
              <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors group">
                <MapPinIcon className="w-4 h-4 mr-2 shrink-0 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="truncate">{user.location || "No location"}</span>
              </div>
              <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors group">
                <LinkIcon className="w-4 h-4 mr-2 shrink-0 text-red-500 group-hover:rotate-45 transition-transform" />
                {user.website ? (
                  <a 
                    href={user.website} 
                    className="hover:underline truncate hover:text-red-600 dark:hover:text-red-400" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {user.website}
                  </a>
                ) : (
                  <span className="truncate">No website</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Sidebar

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card className="overflow-hidden border-red-100 dark:border-red-950/50 shadow-lg">
      <div className="h-20 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 dark:from-red-900 dark:via-orange-900 dark:to-pink-900" />
      <CardHeader className="-mt-8">
        <CardTitle className="text-center text-xl font-bold bg-background px-4 py-2 rounded-lg shadow-md">
          ✨ Rejoins la communauté !
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground text-sm">
          Connecte-toi pour partager, échanger et collaborer avec la communauté Holberton.
        </p>
        <SignInButton mode="modal">
          <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" variant="default">
            Se connecter
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300" variant="outline">
            Créer un compte
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);