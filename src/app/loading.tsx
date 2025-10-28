export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar skeleton */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="flex gap-4">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Post skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              {/* Author skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>

              {/* Content skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>

              {/* Actions skeleton */}
              <div className="flex gap-4 pt-4">
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}