import { Skeleton } from '@/components/ui/skeleton'
import { ProductGridSkeleton } from '@/components/ui/skeleton-loaders'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24 rounded-lg lg:hidden" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Main content */}
        <div className="flex gap-8">
          {/* Filters sidebar */}
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="neo-card space-y-6 rounded-xl p-6">
              {/* Categories filter */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                ))}
              </div>

              {/* Price range filter */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Rating filter */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stock filter */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-9 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  )
}
