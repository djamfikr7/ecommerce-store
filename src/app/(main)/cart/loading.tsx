import { Skeleton } from '@/components/ui/skeleton'

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface-base to-surface-elevated py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="neo-flat flex gap-6 rounded-2xl bg-white/5 p-6 backdrop-blur-sm"
              >
                <Skeleton className="h-28 w-28 shrink-0 rounded-xl" />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="neo-card space-y-6 rounded-2xl p-6">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help section */}
        <div className="neo-flat mt-8 rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    </div>
  )
}
