'use client'

import { cn } from '@/lib/utils'
import type { RatingDistribution } from '@/types/reviews'

interface RatingDistributionProps {
  distribution: RatingDistribution
  totalReviews: number
  onFilterByRating?: (rating: number) => void
  className?: string
}

export function RatingDistribution({
  distribution,
  totalReviews,
  onFilterByRating,
  className,
}: RatingDistributionProps) {
  const ratings = [5, 4, 3, 2, 1] as const

  return (
    <div className={cn('space-y-2', className)} role="list" aria-label="Rating distribution">
      {ratings.map((rating) => {
        const count = distribution[rating as keyof RatingDistribution]
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

        const RowWrapper = onFilterByRating ? 'button' : 'div'

        return (
          <RowWrapper
            key={rating}
            type={onFilterByRating ? 'button' : undefined}
            onClick={onFilterByRating ? () => onFilterByRating(rating) : undefined}
            className={cn(
              'w-full flex items-center gap-3 group',
              onFilterByRating && 'cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded'
            )}
            aria-label={`${rating} stars: ${count} reviews (${percentage.toFixed(1)}%)`}
          >
            {/* Star Label */}
            <span className="flex items-center gap-0.5 w-12 text-sm text-slate-300">
              {rating}
              <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>

            {/* Progress Bar */}
            <div className="flex-1 h-2 rounded-full neo-inset overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={totalReviews}
              />
            </div>

            {/* Count */}
            <span className="w-10 text-right text-sm text-slate-400 tabular-nums">
              {count.toLocaleString()}
            </span>
          </RowWrapper>
        )
      })}
    </div>
  )
}

export function RatingDistributionSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="flex items-center gap-3">
          <div className="w-12 h-4 bg-surface-overlay rounded" />
          <div className="flex-1 h-2 bg-surface-overlay rounded-full neo-inset" />
          <div className="w-10 h-4 bg-surface-overlay rounded" />
        </div>
      ))}
    </div>
  )
}
