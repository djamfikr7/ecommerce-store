'use client'

import { useCurrency, type SupportedCurrency } from './currency-context'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface FormattedPriceProps {
  amountCents: number
  currency?: SupportedCurrency
  showCurrency?: boolean
  className?: string
  skeleton?: boolean
}

export function FormattedPrice({
  amountCents,
  currency: currencyOverride,
  showCurrency = true,
  className,
  skeleton = false,
}: FormattedPriceProps) {
  const { formatPrice, currency: contextCurrency, isLoading } = useCurrency()

  if (skeleton || isLoading) {
    return (
      <Skeleton className={cn('h-6 w-20', className)} />
    )
  }

  const activeCurrency = currencyOverride || contextCurrency

  const formatted = formatPrice(amountCents, {
    showCurrency,
  })

  return (
    <span className={cn('tabular-nums', className)}>
      {formatted}
    </span>
  )
}

/**
 * Compact price display for inline contexts
 */
export function CompactPrice({
  amountCents,
  currency,
  className,
}: {
  amountCents: number
  currency?: SupportedCurrency
  className?: string
}) {
  const { formatPrice, currency: contextCurrency } = useCurrency()
  const activeCurrency = currency || contextCurrency

  return (
    <span className={cn('font-semibold text-accent-primary', className)}>
      {formatPrice(amountCents)}
    </span>
  )
}

/**
 * Large price display for product pages
 */
export function LargePrice({
  amountCents,
  currency,
  className,
}: {
  amountCents: number
  currency?: SupportedCurrency
  className?: string
}) {
  const { formatPrice, currency: contextCurrency } = useCurrency()
  const activeCurrency = currency || contextCurrency

  return (
    <span className={cn('text-3xl font-bold tracking-tight', className)}>
      {formatPrice(amountCents)}
    </span>
  )
}

/**
 * Original price with strikethrough for discounts
 */
export function OriginalPrice({
  amountCents,
  currency,
  className,
}: {
  amountCents: number
  currency?: SupportedCurrency
  className?: string
}) {
  const { formatPrice, currency: contextCurrency } = useCurrency()
  const activeCurrency = currency || contextCurrency

  return (
    <span className={cn('text-slate-500 line-through', className)}>
      {formatPrice(amountCents)}
    </span>
  )
}
