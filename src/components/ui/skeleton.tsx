import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer rounded-lg bg-surface-elevated',
        className
      )}
      aria-hidden="true"
    />
  )
}

function SkeletonText({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="neo-card p-4 space-y-4">
      <Skeleton className="aspect-square rounded-xl" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-3/4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard }
