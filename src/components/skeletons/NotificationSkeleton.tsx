import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton de chargement pour une notification
 */
export default function NotificationSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

        {/* Contenu */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>

        {/* Indicateur non lu */}
        <Skeleton className="h-3 w-3 rounded-full flex-shrink-0" />
      </div>
    </Card>
  );
}

/**
 * Liste de skeletons pour les notifications
 * @param count - Nombre de skeletons à afficher (défaut: 5)
 */
export function NotificationSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-label="Chargement des notifications">
      {Array.from({ length: count }).map((_, index) => (
        <NotificationSkeleton key={index} />
      ))}
    </div>
  );
}
