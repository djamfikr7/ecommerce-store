'use client'

import { formatPrice } from '@/lib/currency'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amount: number
  compareAtAmount?: number | null
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  isLoading?: boolean
}

export function PriceDisplay({
  amount,
  compareAtAmount,
  currency = 'USD',
  size = 'md',
  className,
  isLoading = false,
}: PriceDisplayProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-1', className)}>
        <Skeleton className="h-6 w-24" />
        {compareAtAmount && <Skeleton className="h-4 w-16" />}
      </div>
    )
  }

  const isOnSale = compareAtAmount && compareAtAmount > amount
  const salePercentage = isOnSale
    ? Math.round(((compareAtAmount - amount) / compareAtAmount) * 100)
    : 0

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  const compareAtSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'font-semibold',
          sizeClasses[size],
          isOnSale ? 'text-accent-primary' : 'text-slate-100'
        )}
      >
        {formatPrice(amount, currency)}
      </span>

      {isOnSale && (
        <>
          <span
            className={cn(
              'text-slate-500 line-through',
              compareAtSizeClasses[size]
            )}
          >
            {formatPrice(compareAtAmount, currency)}
          </span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-xs font-medium',
              'bg-accent-danger/20 text-accent-danger border border-accent-danger/30'
            )}
          >
            -{salePercentage}%
          </span>
        </>
      )}
    </div>
  )
}
