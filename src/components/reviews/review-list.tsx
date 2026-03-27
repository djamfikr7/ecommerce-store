'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReviewCard, ReviewCardSkeleton } from './review-card'
import { RatingSummary } from './rating-summary'
import { RatingDistribution } from './rating-distribution'
import { cn } from '@/lib/utils'
import type { ReviewWithUser, RatingDistribution as RatingDistributionType } from '@/types/reviews'

interface ReviewListProps {
  reviews: ReviewWithUser[]
  averageRating: number
  totalReviews: number
  ratingDistribution: RatingDistributionType
  initialSort?: ReviewSortOption
  onHelpful?: (reviewId: string) => Promise<void>
  onLoadMore?: () => Promise<void>
  className?: string
}

export type ReviewSortOption = 'newest' | 'highest' | 'lowest' | 'most_helpful'

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'most_helpful', label: 'Most Helpful' },
]

const INITIAL_DISPLAY_COUNT = 5

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  initialSort = 'newest',
  onHelpful,
  onLoadMore,
  className,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<ReviewSortOption>(initialSort)
  const [showCount, setShowCount] = useState(INITIAL_DISPLAY_COUNT)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [filterRating, setFilterRating] = useState<number | null>(null)

  // Sort and filter reviews
  const filteredAndSortedReviews = reviews
    .filter((review) => filterRating === null || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'most_helpful':
          return b.helpfulCount - a.helpfulCount
        default:
          return 0
      }
    })

  const displayedReviews = filteredAndSortedReviews.slice(0, showCount)
  const hasMore = showCount < filteredAndSortedReviews.length

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      await onLoadMore()
      setShowCount((prev) => prev + 5)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleFilterByRating = (rating: number) => {
    setFilterRating(filterRating === rating ? null : rating)
    setShowCount(INITIAL_DISPLAY_COUNT)
  }

  const clearFilter = () => {
    setFilterRating(null)
    setShowCount(INITIAL_DISPLAY_COUNT)
  }

  if (reviews.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="neo-card p-8 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-overlay flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-100 mb-2">No Reviews Yet</h3>
          <p className="text-slate-400">
            Be the first to review this product and share your experience with other customers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)} id="reviews">
      {/* Header with Summary */}
      <div className="neo-card p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Rating Summary */}
          <div className="flex-shrink-0">
            <RatingSummary
              averageRating={averageRating}
              totalReviews={totalReviews}
              size="md"
            />
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            <RatingDistribution
              distribution={ratingDistribution}
              totalReviews={totalReviews}
              onFilterByRating={handleFilterByRating}
            />
          </div>
        </div>
      </div>

      {/* Filter Banner */}
      <AnimatePresence>
        {filterRating !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="neo-card p-4 flex items-center justify-between"
          >
            <span className="text-slate-300">
              Showing {displayedReviews.length} reviews with {filterRating} stars
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilter}>
              Clear Filter
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort and Review List Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          {filterRating !== null ? filteredAndSortedReviews.length : totalReviews} {filterRating !== null ? 'filtered ' : ''}reviews
        </p>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ReviewSortOption)}
            className="neo-inset appearance-none pl-3 pr-8 py-2 text-sm text-slate-300 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            aria-label="Sort reviews by"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <ReviewCard review={review} onHelpful={onHelpful} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="gap-2"
            >
              {isLoadingMore ? (
                <>
                  <span className="animate-spin">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                  Loading...
                </>
              ) : (
                <>
                  Load More Reviews
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Summary Skeleton */}
      <div className="neo-card p-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="space-y-2">
            <div className="h-8 w-16 bg-surface-overlay rounded" />
            <div className="h-4 w-32 bg-surface-overlay rounded" />
          </div>
          <div className="flex-1 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="w-12 h-4 bg-surface-overlay rounded" />
                <div className="flex-1 h-2 bg-surface-overlay rounded-full neo-inset" />
                <div className="w-10 h-4 bg-surface-overlay rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Cards Skeleton */}
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  )
}
