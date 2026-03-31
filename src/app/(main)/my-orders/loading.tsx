import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            {/* Status Filter */}
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            {/* Date Range */}
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          {/* Status pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.2),0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm"
            >
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="shrink-0 space-y-2">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-700/50 pt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
