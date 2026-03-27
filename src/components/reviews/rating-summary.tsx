'use client'

import Link from 'next/link'
import { RatingStars } from './rating-stars'
import { cn } from '@/lib/utils'

interface RatingSummaryProps {
  averageRating: number
  totalReviews: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  href?: string
  className?: string
}

export function RatingSummary({
  averageRating,
  totalReviews,
  size = 'md',
  showCount = true,
  href,
  className,
}: RatingSummaryProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      number: 'text-xl',
      text: 'text-xs',
    },
    md: {
      container: 'gap-3',
      number: 'text-3xl',
      text: 'text-sm',
    },
    lg: {
      container: 'gap-4',
      number: 'text-4xl',
      text: 'text-base',
    },
  }

  const classes = sizeClasses[size]

  const content = (
    <div className={cn('flex items-center', classes.container, className)}>
      {/* Large Rating Number */}
      <span className={cn('font-bold text-slate-100', classes.number)}>
        {averageRating.toFixed(1)}
      </span>

      {/* Stars and Text */}
      <div className="flex flex-col">
        <RatingStars rating={averageRating} size={size === 'lg' ? 'lg' : 'md'} />
        {showCount && (
          <span className={cn('text-slate-400 mt-0.5', classes.text)}>
            Based on {totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block hover:opacity-80 transition-opacity"
        aria-label={`View all ${totalReviews} reviews`}
      >
        {content}
      </Link>
    )
  }

  return content
}

export function RatingSummaryCompact({
  averageRating,
  totalReviews,
  size = 'sm',
  href,
  className,
}: Omit<RatingSummaryProps, 'showCount'>) {
  return (
    <RatingSummary
      averageRating={averageRating}
      totalReviews={totalReviews}
      size={size}
      showCount={false}
      href={href}
      className={className}
    />
  )
}
