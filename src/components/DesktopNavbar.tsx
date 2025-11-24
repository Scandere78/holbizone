import { BellIcon, HomeIcon, MessageCircle, Users, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import { Badge } from "@/components/ui/badge";
import type { User } from "@clerk/nextjs/server";
import { SerializedUser } from "@/types/user";

interface DesktopNavbarProps {
  user: SerializedUser | null;
  unreadMessages: number;
  unreadNotifications: number;
}

function DesktopNavbar({ user, unreadMessages, unreadNotifications }: DesktopNavbarProps) {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button
        variant="ghost"
        className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        asChild
      >
        <Link href="/">
          <HomeIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            asChild
          >
            <Link href="/explorer">
              <Users className="w-5 h-5" />
              <span className="hidden lg:inline">Explorer</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors relative"
            asChild
          >
            <Link href="/messages">
              <MessageCircle className="w-5 h-5" />
              <span className="hidden lg:inline">Messages</span>
              {unreadMessages > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 border-0 shadow-lg"
                >
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors relative"
            asChild
          >
            <Link href="/notifications">
              <BellIcon className="w-5 h-5" />
              <span className="hidden lg:inline">Notifications</span>
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-1 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 border-0 animate-pulse shadow-lg"
                >
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            asChild
          >
            <Link href="/reclamations">
              <Users className="w-5 h-5" />
              <span className="hidden lg:inline">Question</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            asChild
          >
            <Link
              href={`/profile/${
                user.username ?? user.emailAddresses[0]?.emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 ring-2 ring-red-500/30"
              }
            }}
          />
        </>
      ) : (
        <SignInButton mode="modal" fallbackRedirectUrl="/">
          <Button
            variant="default"
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            Sign In
          </Button>
        </SignInButton>
      )}
    </div>
  );
}

export default DesktopNavbar;
