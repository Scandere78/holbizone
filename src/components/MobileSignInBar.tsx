"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function MobileSignInBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-red-600 via-pink-600 to-orange-600 border-t-4 border-white/20 shadow-2xl">
      <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">✨</span>
          <h2 className="text-xl font-bold text-white">
            Rejoins la communauté !
          </h2>
        </div>
        
        <p className="text-white/90 text-sm max-w-xs">
          Connecte-toi pour partager, échanger et collaborer avec la communauté Holberton.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <SignInButton mode="modal" fallbackRedirectUrl="/">
            <Button
              size="lg"
              className="w-full bg-white text-red-600 hover:bg-gray-100 font-semibold shadow-lg"
            >
              Se connecter
            </Button>
          </SignInButton>

          <SignInButton mode="modal" fallbackRedirectUrl="/">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-white text-white hover:bg-white/10 font-semibold"
            >
              Créer un compte
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
