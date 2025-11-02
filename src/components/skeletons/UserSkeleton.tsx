import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton de chargement pour une carte utilisateur
 * Utilisé dans la recherche, les suggestions, etc.
 */
export default function UserSkeleton() {
  return (
    <Card className="p-4 flex items-center gap-4">
      {/* Avatar */}
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

      {/* Infos utilisateur */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>

      {/* Bouton d'action */}
      <Skeleton className="h-9 w-24 rounded-md" />
    </Card>
  );
}

/**
 * Skeleton pour une liste d'utilisateurs
 * @param count - Nombre de skeletons à afficher (défaut: 5)
 */
export function UserSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-label="Chargement des utilisateurs">
      {Array.from({ length: count }).map((_, index) => (
        <UserSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour le profil utilisateur complet
 */
export function UserProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-card">
        <div className="pt-6 px-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <Skeleton className="w-24 h-24 rounded-full" />

            {/* Nom et username */}
            <Skeleton className="mt-4 h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-32" />

            {/* Bio */}
            <Skeleton className="mt-2 h-4 w-64" />

            {/* Stats */}
            <div className="w-full mt-6">
              <div className="flex justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-5 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-5 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-5 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            </div>

            {/* Bouton */}
            <Skeleton className="w-full h-10 mt-4 rounded-md" />

            {/* Location & Website */}
            <div className="w-full mt-6 space-y-2 mb-6">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-4 w-40 mx-auto" />
              <Skeleton className="h-4 w-36 mx-auto" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
