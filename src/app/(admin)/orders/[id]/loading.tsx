export default function OrderDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-800/50 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-slate-800/50 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Skeleton */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="h-6 w-32 bg-slate-700/50 rounded-lg animate-pulse mb-6" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-slate-700/50 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-slate-700/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="h-6 w-32 bg-slate-700/50 rounded-lg animate-pulse mb-6" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-slate-700/50 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-3 w-40 bg-slate-700/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Skeleton */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="h-6 w-28 bg-slate-700/50 rounded-lg animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-3 w-40 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-700/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Address Skeleton */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="h-6 w-32 bg-slate-700/50 rounded-lg animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-3 w-32 bg-slate-700/50 rounded animate-pulse" />
              <div className="h-3 w-28 bg-slate-700/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Payment Skeleton */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <div className="h-6 w-20 bg-slate-700/50 rounded-lg animate-pulse mb-4" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-slate-700/50 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-700/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
