'use client';

import { useEffect, useState } from 'react';
import { getBlockedUsers, unblockUser } from '@/actions/block.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldOff, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

/**
 * Page des utilisateurs bloqués
 * Permet de voir et gérer la liste des utilisateurs bloqués
 */
export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null);

  /**
   * Charger la liste des utilisateurs bloqués au montage du composant
   */
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setIsLoading(true);
        const result = await getBlockedUsers();
        if (result.success) {
          setBlockedUsers(result.blocked);
        } else {
          toast.error('Erreur lors du chargement');
        }
      } catch (error) {
        toast.error('Erreur');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  /**
   * Gérer le déblocage d'un utilisateur
   * @param userId - ID de l'utilisateur à débloquer
   */
  const handleUnblock = async (userId: string) => {
    try {
      setUnblockingUserId(userId);
      const result = await unblockUser(userId);

      if (result.success) {
        // Retirer l'utilisateur de la liste locale
        setBlockedUsers((prev) =>
          prev.filter((block) => block.blocked.id !== userId)
        );
        toast.success('Utilisateur débloqué');
      } else {
        toast.error(result.error || 'Erreur lors du déblocage');
      }
    } catch (error) {
      toast.error('Erreur lors du déblocage');
    } finally {
      setUnblockingUserId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* En-tête de la page */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl">
          <ShieldOff className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Utilisateurs bloqués
          </h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs que vous avez bloqués
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      {isLoading ? (
        // Loading Skeletons pendant le chargement
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-9 w-24" />
            </Card>
          ))}
        </div>
      ) : blockedUsers.length === 0 ? (
        // État vide - aucun utilisateur bloqué
        <Card className="p-12 text-center border-red-100 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="space-y-2">
            <ShieldOff className="w-12 h-12 mx-auto text-red-600/50" />
            <p className="text-lg font-semibold text-foreground">
              Aucun utilisateur bloqué
            </p>
            <p className="text-muted-foreground">
              Vous n'avez bloqué aucun utilisateur pour le moment
            </p>
          </div>
        </Card>
      ) : (
        // Liste des utilisateurs bloqués
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground font-medium">
            {blockedUsers.length} utilisateur{blockedUsers.length > 1 ? 's' : ''}{' '}
            bloqué{blockedUsers.length > 1 ? 's' : ''}
          </div>

          {blockedUsers.map((block) => (
            <Card
              key={block.id}
              className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border-red-100 dark:border-red-950/50"
            >
              {/* Avatar et informations de l'utilisateur bloqué */}
              <Link
                href={`/profile/${block.blocked.username}`}
                className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-12 w-12 ring-2 ring-red-500/20">
                  <AvatarImage src={block.blocked.image || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-500 text-white font-bold">
                    {block.blocked.name?.[0]?.toUpperCase() ||
                      block.blocked.username?.[0]?.toUpperCase() ||
                      '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {block.blocked.name || block.blocked.username}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    @{block.blocked.username}
                  </p>
                  {block.blocked.bio && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {block.blocked.bio}
                    </p>
                  )}
                </div>
              </Link>

              {/* Bouton de déblocage */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnblock(block.blocked.id)}
                disabled={unblockingUserId === block.blocked.id}
                className="border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 text-red-600"
              >
                {unblockingUserId === block.blocked.id ? (
                  'Déblocage...'
                ) : (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Débloquer
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
