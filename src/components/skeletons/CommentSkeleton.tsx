import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton de chargement pour un commentaire
 */
export default function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
      {/* Avatar */}
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

      {/* Contenu */}
      <div className="flex-1 space-y-2">
        {/* Nom et username */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Contenu du commentaire */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Date */}
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Menu d'actions */}
      <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
    </div>
  );
}

/**
 * Liste de skeletons pour plusieurs commentaires
 * @param count - Nombre de skeletons à afficher (défaut: 3)
 */
export function CommentSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div aria-label="Chargement des commentaires">
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </div>
  );
}
