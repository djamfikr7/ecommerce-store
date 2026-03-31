import { LoadingSpinner } from '@/components/ui/loading-spinner'

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`shimmer rounded-lg bg-surface-elevated ${className || ''}`}
      aria-hidden="true"
    />
  )
}

function SkeletonNav() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <SkeletonBlock className="h-6 w-32" />
      </div>
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-5 w-5 rounded-full" />
        <SkeletonBlock className="h-5 w-5 rounded-full" />
        <SkeletonBlock className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

function SkeletonHero() {
  return (
    <div className="px-6 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <SkeletonBlock className="mx-auto mb-4 h-12 w-3/4" />
        <SkeletonBlock className="mx-auto mb-2 h-5 w-1/2" />
        <SkeletonBlock className="mx-auto mb-8 h-5 w-2/5" />
        <div className="flex justify-center gap-4">
          <SkeletonBlock className="h-12 w-36 rounded-xl" />
          <SkeletonBlock className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-7xl">
        <SkeletonBlock className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="neo-card overflow-hidden p-0">
              <SkeletonBlock className="aspect-square rounded-none" />
              <div className="space-y-2 p-3">
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="h-5 w-3/4" />
                <SkeletonBlock className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function GlobalLoading() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      <SkeletonNav />
      <SkeletonHero />
      <SkeletonCards />

      <div className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center">
        <div className="neo-raised-sm pointer-events-auto flex items-center gap-3 px-5 py-3">
          <LoadingSpinner size="sm" variant="dots" />
          <span className="text-sm text-slate-400">Loading page...</span>
        </div>
      </div>
    </div>
  )
}
