import { Skeleton } from '@/components/ui/skeleton'
import { ProductCardSkeleton } from '@/components/ui/skeleton-loaders'

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Product main section */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-5" />
                  ))}
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="h-px w-full" />

            <div className="space-y-3">
              <Skeleton className="h-5 w-16" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-16 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Skeleton className="h-14 w-full max-w-[160px] rounded-xl" />
              <Skeleton className="h-14 flex-1 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-12">
          <div className="mb-6 flex gap-6 border-b border-white/10 pb-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Related products skeleton */}
        <div>
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
