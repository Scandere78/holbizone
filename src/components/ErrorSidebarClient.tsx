'use client'; // ✅ Client Component

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

/**
 * Composant ErrorSidebar (Client Component)
 * Affiche une carte d'erreur avec un bouton Réessayer
 * 
 * ✅ Utilise 'use client' car il contient un onClick handler
 */
interface ErrorSidebarClientProps {
  message: string;
}

export default function ErrorSidebarClient({
  message,
}: ErrorSidebarClientProps) {
  // ✅ Handler défini dans le Client Component
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="sticky top-20">
      <Card className="overflow-hidden border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 shadow-lg hover:shadow-xl transition-shadow">
        {/* En-tête d'erreur */}
        <div className="h-20 bg-gradient-to-r from-red-400 to-orange-400 dark:from-red-800 dark:to-orange-800" />

        {/* Contenu du message d'erreur */}
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-red-600 dark:text-red-400 font-semibold text-lg">
              ⚠️ Erreur
            </p>
            <p className="text-muted-foreground text-sm">{message}</p>
          </div>

          {/* Bouton pour recharger (avec onClick) */}
          <Button
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
            onClick={handleRetry}
          >
            🔄 Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}