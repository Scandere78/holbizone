"use client";

import { BellIcon, HomeIcon, MessageCircleIcon, SearchIcon, MenuIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SerializedUser } from "@/types/user";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SignInButton, useClerk } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";

interface MobileNavbarProps {
  user: SerializedUser | null;
}

function MobileNavbar({ user }: MobileNavbarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const isActive = (path: string) => pathname === path;

  // Si pas d'utilisateur, ne rien afficher (évite l'erreur Clerk)
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar - Style Instagram */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-red-100/50 dark:border-red-950/50 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
              isActive("/")
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400 active:scale-95"
            }`}
          >
            <HomeIcon
              className={`w-7 h-7 ${isActive("/") ? "fill-current" : ""}`}
              strokeWidth={isActive("/") ? 2.5 : 2}
            />
            {isActive("/") && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1" />
            )}
          </Link>

          {/* Search / Explore */}
          <Link
            href="/explorer"
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
              isActive("/explorer")
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400 active:scale-95"
            }`}
          >
            <SearchIcon
              className={`w-7 h-7 ${isActive("/explorer") ? "fill-current" : ""}`}
              strokeWidth={isActive("/explorer") ? 2.5 : 2}
            />
            {isActive("/explorer") && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1" />
            )}
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
              isActive("/messages")
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400 active:scale-95"
            }`}
          >
            <MessageCircleIcon
              className={`w-7 h-7 ${isActive("/messages") ? "fill-current" : ""}`}
              strokeWidth={isActive("/messages") ? 2.5 : 2}
            />
            {isActive("/messages") && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1" />
            )}
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className={`relative flex flex-col items-center justify-center w-16 h-16 transition-colors ${
              isActive("/notifications")
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400 active:scale-95"
            }`}
          >
            <BellIcon
              className={`w-7 h-7 ${isActive("/notifications") ? "fill-current" : ""}`}
              strokeWidth={isActive("/notifications") ? 2.5 : 2}
            />
            {isActive("/notifications") && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1" />
            )}
          </Link>

          {/* Menu Hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center w-16 h-16 transition-colors text-gray-600 dark:text-gray-400 active:scale-95">
                <MenuIcon className="w-7 h-7" strokeWidth={2} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Menu
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col space-y-4 mt-6">
                {/* Profile Section */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-red-500/30">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || "Profile"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                        {user.firstName?.[0] || user.username?.[0] || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.fullName || user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username || user.emailAddresses[0]?.emailAddress.split("@")[0] || "user"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Menu Items */}
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href={`/profile/${user.username ?? user.emailAddresses[0]?.emailAddress.split("@")[0]}`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mon Profil
                  </Link>
                </Button>

                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/settings">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Paramètres
                  </Link>
                </Button>

                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/saved">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Publications sauvegardées
                  </Link>
                </Button>

                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/help">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Aide
                  </Link>
                </Button>

                <Separator />

                {/* Sign Out Button */}
                <Button 
                  variant="ghost" 
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
        </div>
      </nav>
    </>
  );
}

export default MobileNavbar;