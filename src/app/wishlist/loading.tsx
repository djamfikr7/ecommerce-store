export default function WishlistLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="container-neo">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-surface-overlay rounded animate-pulse" />
            <div className="h-8 w-48 bg-surface-overlay rounded animate-pulse" />
          </div>
          <div className="w-32 h-10 bg-surface-overlay rounded-lg animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="neo-card p-4">
              {/* Image */}
              <div className="aspect-square rounded-xl bg-surface-overlay mb-4 animate-pulse" />

              {/* Content */}
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-surface-overlay rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-surface-overlay rounded animate-pulse" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-20 bg-surface-overlay rounded animate-pulse" />
                  <div className="h-8 w-24 bg-surface-overlay rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
