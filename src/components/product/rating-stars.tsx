'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function RatingStars({
  rating,
  reviewCount,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex)
    }
  }

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex gap-0.5"
        onMouseLeave={handleMouseLeave}
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filledPercentage = Math.min(100, Math.max(0, (displayRating - (starIndex - 1)) * 100))
          const isFull = displayRating >= starIndex
          const isHalf = !isFull && displayRating > starIndex - 1

          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              disabled={!interactive}
              className={cn(
                'relative transition-transform',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
              aria-label={`${starIndex} star${starIndex !== 1 ? 's' : ''}`}
              role={interactive ? 'radio' : undefined}
              aria-checked={interactive ? displayRating === starIndex : undefined}
            >
              <svg
                className={cn(sizeClasses[size], 'text-slate-600')}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>

              {/* Filled portion */}
              <svg
                className={cn(
                  sizeClasses[size],
                  'absolute inset-0',
                  (isFull || isHalf) ? 'text-accent-warning fill-accent-warning' : 'text-transparent'
                )}
                viewBox="0 0 24 24"
                style={isHalf ? { clipPath: `inset(0 ${100 - filledPercentage}% 0 0)` } : undefined}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )
        })}
      </div>

      {reviewCount !== undefined && (
        <span className={cn('text-slate-400 ml-1', textSizeClasses[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
