'use client';

import { useEffect, useState } from 'react';
import { getUserBookmarks } from '@/actions/bookmark.action';
import PostCard from '@/components/PostCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true);
        const result = await getUserBookmarks();
        if (result.success) {
          setBookmarks(result.bookmarks);
        } else {
          toast.error('Erreur lors du chargement');
        }
      } catch (error) {
        toast.error('Erreur');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl">
          <Bookmark className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            Posts sauvegardés
          </h1>
          <p className="text-muted-foreground">
            Vos posts favoris à consulter plus tard
          </p>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        // Loading Skeletons
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        // Empty State
        <Card className="p-12 text-center border-yellow-100 dark:border-yellow-950/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <div className="space-y-2">
            <Bookmark className="w-12 h-12 mx-auto text-yellow-600/50" />
            <p className="text-lg font-semibold text-foreground">
              Aucun post sauvegardé
            </p>
            <p className="text-muted-foreground">
              Sauvegardez vos posts favoris pour les retrouver ici
            </p>
          </div>
        </Card>
      ) : (
        // Bookmarks List
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground font-medium">
            {bookmarks.length} post{bookmarks.length > 1 ? 's' : ''} sauvegardé{bookmarks.length > 1 ? 's' : ''}
          </div>
          {bookmarks.map((bookmark) => (
            <PostCard key={bookmark.id} post={bookmark.post} />
          ))}
        </div>
      )}
    </div>
  );
}