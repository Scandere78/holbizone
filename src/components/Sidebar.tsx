import { currentUser } from '@clerk/nextjs/server';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { getUserByClerkId } from '@/actions/user.action';
import { LinkIcon, MapPinIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { logger } from '@/lib/logger';

/**
 * Composant Sidebar Principal
 * Affiche le profil utilisateur ou un CTA d'authentification
 */
async function Sidebar() {
  try {
    // Récupérer l'utilisateur Clerk authentifié
    const authUser = await currentUser();

    // Si aucun utilisateur n'est authentifié, afficher le sidebar de connexion
    if (!authUser) {
      logger.debug({
        context: 'Sidebar',
        action: 'Rendering unauthenticated sidebar',
      });
      return <UnAuthenticatedSidebar />;
    }

    // Récupérer les données de l'utilisateur depuis la base de données
    const user = await getUserByClerkId(authUser.id);

    if (!user) {
      logger.warn({
        context: 'Sidebar',
        action: 'User not found in database',
        details: { clerkId: authUser.id },
      });
      return <ErrorSidebar message="Profil utilisateur non trouvé" />;
    }

    logger.debug({
      context: 'Sidebar',
      action: 'User sidebar loaded successfully',
      details: { userId: user.id, username: user.username },
    });

    return (
      <div className="sticky top-20 space-y-4">
        {/* Carte du profil utilisateur */}
        <Card className="overflow-hidden border-red-100 dark:border-red-950/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* En-tête dégradé */}
          <div className="h-20 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 dark:from-red-900 dark:via-orange-900 dark:to-pink-900" />

          {/* Contenu du profil */}
          <CardContent className="pt-6 -mt-10">
            <div className="flex flex-col items-center text-center">
              {/* Avatar et informations de base */}
              <Link
                href={`/profile/${user.username}`}
                className="flex flex-col items-center justify-center group"
              >
                {/* Avatar avec indicateur de statut en ligne */}
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-xl ring-2 ring-red-200 dark:ring-red-800 transition-transform group-hover:scale-105 duration-300">
                    <AvatarImage
                      src={user.image || '/avatar.png'}
                      alt={user.name ?? undefined}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Indicateur de statut en ligne */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-background rounded-full" />
                </div>

                {/* Nom et username */}
                <div className="mt-4 space-y-1">
                  <h3 className="font-bold text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {user.name || 'Utilisateur'}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </Link>

              {/* Bio utilisateur */}
              {user.bio && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                  {user.bio}
                </p>
              )}

              {/* Séparateur et statistiques */}
              <div className="w-full mt-4">
                <Separator className="mb-4" />

                {/* Compteurs Following/Followers */}
                <div className="flex justify-around gap-4">
                  {/* Following */}
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex-1 group hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition-colors"
                  >
                    <p className="font-bold text-lg text-red-600 dark:text-red-400">
                      {user._count?.following ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Abonnements</p>
                  </Link>

                  {/* Séparateur vertical */}
                  <Separator orientation="vertical" className="h-auto" />

                  {/* Followers */}
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex-1 group hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition-colors"
                  >
                    <p className="font-bold text-lg text-red-600 dark:text-red-400">
                      {user._count?.followers ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Abonnés</p>
                  </Link>
                </div>

                <Separator className="mt-4 mb-4" />
              </div>

              {/* Localisation et site web */}
              <div className="w-full space-y-3 text-sm">
                {/* Localisation */}
                {user.location && (
                  <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors group">
                    <MapPinIcon className="w-4 h-4 mr-2 shrink-0 text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}

                {/* Site web */}
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
                    <span className="truncate text-muted-foreground">Pas de site web</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    // Logger l'erreur pour le debug
    logger.error({
      context: 'Sidebar',
      action: 'Failed to load authenticated sidebar',
      error,
    });

    // Afficher un message d'erreur à l'utilisateur
    return <ErrorSidebar message="Erreur au chargement du profil" />;
  }
}

export default Sidebar;

/**
 * Composant Sidebar pour utilisateurs non authentifiés
 * Affiche un CTA pour se connecter/inscrire
 */
const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card className="overflow-hidden border-red-100 dark:border-red-950/50 shadow-lg">
      {/* En-tête dégradé */}
      <div className="h-20 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 dark:from-red-900 dark:via-orange-900 dark:to-pink-900" />

      {/* Titre accrocheur */}
      <CardHeader className="-mt-8">
        <CardTitle className="text-center text-xl font-bold bg-background px-4 py-2 rounded-lg shadow-md">
          ✨ Rejoins la communauté !
        </CardTitle>
      </CardHeader>

      {/* Contenu d'appel à l'action */}
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground text-sm">
          Connecte-toi pour partager, échanger et collaborer avec la communauté
          Holberton.
        </p>

        {/* Bouton de connexion */}
        <SignInButton mode="modal">
          <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            Se connecter
          </Button>
        </SignInButton>

        {/* Bouton d'inscription */}
        <SignUpButton mode="modal">
          <Button
            className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300"
            variant="outline"
          >
            Créer un compte
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);

/**
 * Composant Sidebar d'erreur
 * Affiche un message d'erreur en cas de problème
 */
interface ErrorSidebarProps {
  message: string;
}

const ErrorSidebar = ({ message }: ErrorSidebarProps) => (
  <div className="sticky top-20">
    <Card className="overflow-hidden border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
      {/* En-tête d'erreur */}
      <div className="h-20 bg-gradient-to-r from-red-400 to-orange-400 dark:from-red-800 dark:to-orange-800" />

      {/* Message d'erreur */}
      <CardContent className="pt-6 space-y-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            ⚠️ Erreur
          </p>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>

        {/* Bouton pour recharger */}
        <Button
          variant="outline"
          className="w-full border-red-600 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </CardContent>
    </Card>
  </div>
);