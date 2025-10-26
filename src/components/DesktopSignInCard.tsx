"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DesktopSignInCard() {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <Card className="bg-gradient-to-br from-red-600 via-pink-600 to-orange-600 border-none shadow-2xl">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl">✨</span>
            <h2 className="text-2xl font-bold text-white">
              Rejoins la communauté !
            </h2>
          </div>
          
          <p className="text-white/90 text-sm max-w-xs">
            Connecte-toi pour partager, échanger et collaborer avec la communauté Holberton.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <SignInButton mode="modal">
              <Button 
                size="lg"
                className="w-full bg-white text-red-600 hover:bg-gray-100 font-semibold shadow-lg"
              >
                Se connecter
              </Button>
            </SignInButton>
            
            <SignInButton mode="modal">
              <Button 
                size="lg"
                variant="outline"
                className="w-full border-2 border-white text-white hover:bg-white/10 font-semibold"
              >
                Créer un compte
              </Button>
            </SignInButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
