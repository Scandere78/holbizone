import { BellIcon, HomeIcon, MenuIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import NotificationBadge from "./NotificationBadge";
import type { User } from "@clerk/nextjs/server";
import { Suspense } from "react";

interface MobileNavbarProps {
  user: User | null;
}

function MobileNavbar({ user }: MobileNavbarProps) {
  return (
    <div className="md:hidden flex items-center gap-2">
      <ModeToggle />
      {user && <UserButton />}
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-left bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Menu
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-4 mt-4">
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/">
                <HomeIcon className="w-5 h-5 mr-2" />
                Home
              </Link>
            </Button>

            {user ? (
              <>
                <Button variant="ghost" className="justify-start relative" asChild>
                  <Link href="/notifications">
                    <BellIcon className="w-5 h-5 mr-2" />
                    Notifications
                    <Suspense fallback={null}>
                      <NotificationBadge />
                    </Suspense>
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link
                    href={`/profile/${
                      user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
                    }`}
                  >
                    <UserIcon className="w-5 h-5 mr-2" />
                    Profile
                  </Link>
                </Button>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="w-full bg-gradient-to-r from-red-600 to-orange-600">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;