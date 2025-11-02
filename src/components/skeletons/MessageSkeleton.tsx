import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton de chargement pour une conversation dans la liste
 */
export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer border-b border-gray-100 dark:border-gray-800">
      {/* Avatar */}
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

      {/* Contenu */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

/**
 * Liste de skeletons pour les conversations
 * @param count - Nombre de skeletons à afficher (défaut: 5)
 */
export function ConversationSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div aria-label="Chargement des conversations">
      {Array.from({ length: count }).map((_, index) => (
        <ConversationSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton de chargement pour un message individuel
 */
export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}

      <div className={`space-y-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <Skeleton className="h-16 w-64 rounded-lg" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * Liste de skeletons pour les messages
 * @param count - Nombre de skeletons à afficher (défaut: 5)
 */
export function MessageSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4" aria-label="Chargement des messages">
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} isOwn={index % 2 === 0} />
      ))}
    </div>
  );
}
