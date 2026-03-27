'use client'

import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  reviewCount?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function RatingStars({
  rating,
  size = 'md',
  reviewCount,
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
    if (interactive && onChange) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(star)
      }
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex items-center gap-0.5"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(rating)
          const isPartial = !isFilled && star <= Math.ceil(rating) && rating % 1 > 0
          const starValue = star <= Math.floor(rating) ? 100 : star <= Math.ceil(rating) ? (rating % 1) * 100 : 0

          const StarButton = interactive ? 'button' : 'span'
          const starElement = (
            <StarButton
              key={star}
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => handleClick(star) : undefined}
              onKeyDown={interactive ? (e) => handleKeyDown(e, star) : undefined}
              disabled={!interactive}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded'
              )}
              aria-label={interactive ? `Rate ${star} stars` : undefined}
              aria-checked={interactive ? star === Math.round(rating) : undefined}
              role={interactive ? 'radio' : undefined}
            >
              {/* Background star (empty) */}
              <svg
                className={cn(sizeClasses[size], 'text-slate-600')}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {/* Filled star overlay */}
              {isFilled && (
                <svg
                  className={cn(sizeClasses[size], 'text-amber-400 fill-amber-400 absolute inset-0')}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}

              {/* Partial fill for half stars */}
              {isPartial && (
                <svg
                  className={cn(sizeClasses[size], 'absolute inset-0')}
                  viewBox="0 0 20 20"
                >
                  <defs>
                    <linearGradient id={`partial-${star}`}>
                      <stop offset={`${starValue}%`} stopColor="currentColor" className="text-amber-400 fill-amber-400" />
                      <stop offset={`${starValue}%`} stopColor="currentColor" className="text-slate-600" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#partial-${star})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              )}
            </StarButton>
          )

          return starElement
        })}
      </div>

      {reviewCount !== undefined && (
        <span className="text-sm text-slate-400 ml-1">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}
