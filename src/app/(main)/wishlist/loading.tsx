import { Skeleton } from '@/components/ui/skeleton'
import { ProductCardSkeleton } from '@/components/ui/skeleton-loaders'

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#16213e] py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-4 w-36" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="neo-card space-y-4 rounded-2xl p-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-7 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
