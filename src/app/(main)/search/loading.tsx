import { Skeleton } from '@/components/ui/skeleton'
import { ProductGridSkeleton } from '@/components/ui/skeleton-loaders'

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <Skeleton className="h-14 w-full max-w-3xl rounded-2xl" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        {/* Results info */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Results grid */}
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  )
}
