'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OptimizedAvatar } from '@/components/ui/optimized-image';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import FollowButton from '@/components/FollowButton';
import { Users, Search, X, FileText, UserCheck, UserPlus } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { searchUsers } from '@/actions/search.action';

interface UserSearchListProps {
  initialUsers: any[];
}

export default function UserSearchList({ initialUsers }: UserSearchListProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Fonction de recherche
   */
  const performSearch = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      setHasSearched(true);

      if (!searchQuery.trim()) {
        setUsers(initialUsers);
        return;
      }

      const result = await searchUsers(searchQuery);

      if (result.success) {
        setUsers(result.users || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Debounce de 500ms
   */
  const debouncedSearch = useDebouncedCallback(performSearch, 500);

  /**
   * Gérer le changement de l'input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  /**
   * Nettoyer la recherche
   */
  const handleClear = () => {
    setQuery('');
    setUsers(initialUsers);
    setHasSearched(false);
  };

  return (
    <div className="space-y-8">
      {/* ===== EN-TÊTE ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Explorer
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Découvrez tous les membres de la communauté HolbiHub
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-md">
          <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-background hover:border-red-300 focus-within:border-red-500 transition-colors shadow-sm">
            <Search className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />

            <input
              type="text"
              placeholder="Chercher par nom ou username..."
              value={query}
              onChange={handleInputChange}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />

            {query && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                aria-label="Effacer"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== RÉSULTATS ===== */}

      {/* État de chargement */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border-red-100 dark:border-red-950/50">
              <div className="flex items-start gap-3">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16 mt-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pas de résultats */}
      {!isLoading && hasSearched && users.length === 0 && (
        <Card className="p-12 text-center border-red-100 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">😕 Aucun utilisateur trouvé</p>
            <p className="text-muted-foreground">
              Essaie une autre recherche
            </p>
          </div>
        </Card>
      )}

      {/* Liste des utilisateurs */}
      {!isLoading && users.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground font-medium">
            {hasSearched ? `${users.length} résultat${users.length > 1 ? 's' : ''}` : `${users.length} utilisateur${users.length > 1 ? 's' : ''}`}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => {
              const isFollowing = user.followers && user.followers.length > 0;

              return (
                <Card
                  key={user.id}
                  className="p-5 border-red-100 dark:border-red-950/50 hover:shadow-lg hover:border-red-300 dark:hover:border-red-800 transition-all duration-300 group"
                >
                  {/* Header avec avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/profile/${user.username}`} className="group/avatar">
                      <OptimizedAvatar
                        src={user.image || null}
                        alt={user.name || user.username || 'User'}
                        fallbackText={user.name || user.username || 'User'}
                        size={56}
                        className="ring-2 ring-red-500/20 group-hover/avatar:ring-red-500/50 transition-all cursor-pointer"
                      />
                    </Link>

                    {/* Follow Button */}
                    <FollowButton
                      targetUserId={user.id}
                      isFollowing={isFollowing}
                    />
                  </div>

                  {/* Infos utilisateur */}
                  <div className="space-y-2 mb-4">
                    <Link href={`/profile/${user.username}`}>
                      <h3 className="font-bold text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                        {user.name || user.username}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      @{user.username}
                    </p>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {user.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100/50 dark:border-red-900/30">
                    <div className="text-center">
                      <div className="font-bold text-lg text-red-600 dark:text-red-400">
                        {user._count?.posts || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 block md:hidden">Posts</div>
                      <div className="hidden md:flex justify-center mt-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="text-center border-x border-red-200 dark:border-red-800">
                      <div className="font-bold text-lg text-red-600 dark:text-red-400">
                        {user._count?.followers || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 block md:hidden">Followers</div>
                      <div className="hidden md:flex justify-center mt-1">
                        <UserCheck className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-red-600 dark:text-red-400">
                        {user._count?.following || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 block md:hidden">Following</div>
                      <div className="hidden md:flex justify-center mt-1">
                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Pas de données du tout */}
      {!isLoading && !hasSearched && users.length === 0 && (
        <Card className="p-12 text-center border-red-100 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20">
          <p className="text-muted-foreground">Aucun utilisateur disponible</p>
        </Card>
      )}
    </div>
  );
}
