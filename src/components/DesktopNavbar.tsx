import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import type { User } from "@clerk/nextjs/server";

interface DesktopNavbarProps {
  user: User | null;
}

function DesktopNavbar({ user }: DesktopNavbarProps) {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" asChild>
        <Link href="/">
          <HomeIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" asChild>
            <Link href="/notifications">
              <BellIcon className="w-5 h-5" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" asChild>
            <Link
              href={`/profile/${
                user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
            Sign In
          </Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;