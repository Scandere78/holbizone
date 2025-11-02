import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton de chargement pour les posts
 * Affiche un état de chargement pendant que les posts sont récupérés
 */
export default function PostSkeleton() {
  return (
    <Card className="p-6 border-red-100 dark:border-red-950/50">
      {/* Header - Avatar + Nom + Username */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full" />

          {/* Infos utilisateur */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Menu button */}
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Contenu du post */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Image (optionnelle) */}
      <Skeleton className="h-64 w-full rounded-lg mb-4" />

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 py-3 border-t border-b border-red-100 dark:border-red-950/50">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-around gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </Card>
  );
}

/**
 * Liste de skeletons pour plusieurs posts
 * @param count - Nombre de skeletons à afficher (défaut: 3)
 */
export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6" aria-label="Chargement des posts">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}
