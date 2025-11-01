import Link from "next/link";
import NavbarWrapper from "./NavbarWrapper";
import Image from "next/image";
import { SerializedUser } from "@/types/user";

interface NavbarProps {
  user: SerializedUser | null;
  unreadMessages: number;
  unreadNotifications: number;
}

function Navbar({ user, unreadMessages, unreadNotifications }: NavbarProps) {

  return (
    <nav className="sticky top-0 w-full border-b border-red-100/50 dark:border-red-950/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image 
                  src="/Holberton.png" 
                  alt="HolbiHub Logo" 
                  width={40} 
                  height={40}
                  className="rounded-lg transition-transform group-hover:scale-110 duration-300"
                />
                <div className="absolute inset-0 bg-red-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent font-mono tracking-wider">
                HolbiZone
              </span>
            </Link>
          </div>

          <NavbarWrapper 
            initialUser={user} 
            unreadMessages={unreadMessages}
            unreadNotifications={unreadNotifications}
          />
        </div>
      </div>
    </nav>
  );
}
export default Navbar;