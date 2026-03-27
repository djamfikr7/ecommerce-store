import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/ui/container'

export default function ProductLoading() {
  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Breadcrumb skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8 bg-surface-elevated rounded shimmer" />
            <Skeleton className="h-4 w-4 bg-surface-elevated rounded shimmer" />
            <Skeleton className="h-4 w-24 bg-surface-elevated rounded shimmer" />
          </div>
        </div>

        {/* Main product layout skeleton */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Gallery skeleton */}
          <div className="animate-pulse">
            <Skeleton className="aspect-square rounded-2xl bg-surface-elevated mb-4 shimmer" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg bg-surface-elevated shimmer" />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="animate-pulse space-y-6">
            <div>
              <Skeleton className="h-4 w-24 bg-surface-elevated rounded mb-2 shimmer" />
              <Skeleton className="h-10 w-3/4 bg-surface-elevated rounded shimmer" />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-5 w-5 bg-surface-elevated rounded shimmer" />
                ))}
              </div>
              <Skeleton className="h-4 w-20 bg-surface-elevated rounded shimmer" />
            </div>

            <div className="py-4 border-y border-surface-elevated">
              <Skeleton className="h-8 w-32 bg-surface-elevated rounded shimmer" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-surface-elevated rounded shimmer" />
              <Skeleton className="h-4 w-3/4 bg-surface-elevated rounded shimmer" />
            </div>

            <div>
              <Skeleton className="h-4 w-16 bg-surface-elevated rounded mb-2 shimmer" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-14 bg-surface-elevated rounded-lg shimmer" />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-10 w-32 bg-surface-elevated rounded-lg shimmer" />
              <Skeleton className="h-10 w-40 bg-surface-elevated rounded-lg shimmer" />
            </div>

            <Skeleton className="h-6 w-24 bg-surface-elevated rounded shimmer" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-16">
          <div className="neo-card">
            <div className="flex border-b border-surface-elevated">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="flex-1 h-12 bg-surface-elevated rounded-none shimmer" />
              ))}
            </div>
            <div className="p-6 space-y-3">
              <Skeleton className="h-4 w-full bg-surface-elevated rounded shimmer" />
              <Skeleton className="h-4 w-3/4 bg-surface-elevated rounded shimmer" />
              <Skeleton className="h-4 w-5/6 bg-surface-elevated rounded shimmer" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
