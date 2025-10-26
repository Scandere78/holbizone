import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function NotificationsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-red-100 dark:border-red-950/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-pink-500/10 dark:from-red-950/30 dark:via-orange-950/30 dark:to-pink-950/30 border-b border-red-100 dark:border-red-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border-b border-red-100 dark:border-red-950/50 last:border-0">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
