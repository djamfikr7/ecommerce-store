export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800/50 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-slate-800/50 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-36 bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="h-10 w-36 bg-slate-800/50 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-24 bg-slate-700/50 rounded-lg animate-pulse" />
                <div className="h-8 w-32 bg-slate-700/50 rounded-lg animate-pulse" />
                <div className="h-3 w-20 bg-slate-700/50 rounded-lg animate-pulse" />
              </div>
              <div className="h-12 w-12 bg-slate-700/50 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="h-6 w-40 bg-slate-700/50 rounded-lg animate-pulse mb-6" />
          <div className="h-[300px] bg-slate-700/30 rounded-xl animate-pulse" />
        </div>
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="h-6 w-32 bg-slate-700/50 rounded-lg animate-pulse mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-36 bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse" />
                </div>
                <div className="h-5 w-12 bg-slate-700/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="h-6 w-32 bg-slate-700/50 rounded-lg animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-6 w-24 bg-slate-700/50 rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-slate-700/50 rounded ml-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
