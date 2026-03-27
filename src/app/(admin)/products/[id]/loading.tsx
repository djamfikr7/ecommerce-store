export default function ProductLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-40 bg-slate-800/50 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-slate-800/50 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-slate-800/50 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-2">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-28 bg-slate-700/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-11 bg-slate-700/50 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-11 bg-slate-700/50 rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
            <div className="h-32 bg-slate-700/50 rounded-xl animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-11 bg-slate-700/50 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-11 bg-slate-700/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
