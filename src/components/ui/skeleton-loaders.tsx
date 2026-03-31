'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonBaseProps {
  className?: string
}

function SkeletonBase({ className }: SkeletonBaseProps) {
  return (
    <motion.div
      className={cn('shimmer rounded-lg bg-surface-elevated', className)}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      aria-hidden="true"
    />
  )
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('neo-card space-y-4 p-4', className)}
      role="status"
      aria-label="Loading product"
    >
      <SkeletonBase className="aspect-square rounded-xl" />
      <div className="space-y-2">
        <SkeletonBase className="h-3 w-16" />
        <SkeletonBase className="h-5 w-3/4" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-14" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <SkeletonBase className="h-7 w-24" />
        <SkeletonBase className="h-9 w-9 rounded-lg" />
      </div>
      <span className="sr-only">Loading product...</span>
    </div>
  )
}

export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <ProductCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('neo-flat flex items-center gap-4 p-4', className)}
      role="status"
      aria-label="Loading item"
    >
      <SkeletonBase className="h-14 w-14 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-1/2" />
      </div>
      <SkeletonBase className="h-8 w-20 shrink-0" />
      <span className="sr-only">Loading item...</span>
    </div>
  )
}

export function ListSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          <ListItemSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr role="status" aria-label="Loading row">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBase
            className={cn(
              'h-4',
              i === 0 ? 'w-8' : i === columns - 1 ? 'w-16' : 'w-full max-w-[120px]',
            )}
          />
        </td>
      ))}
      <span className="sr-only">Loading row...</span>
    </tr>
  )
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn('neo-card overflow-hidden', className)}
      role="status"
      aria-label="Loading table"
    >
      <table className="w-full">
        <thead>
          <tr className="border-border-subtle border-b">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <SkeletonBase className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="border-border-subtle border-b last:border-0"
            >
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <SkeletonBase
                    className={cn(
                      'h-4',
                      j === 0 ? 'w-8' : j === columns - 1 ? 'w-16' : 'w-full max-w-[120px]',
                    )}
                  />
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading table...</span>
    </div>
  )
}

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8 p-6', className)} role="status" aria-label="Loading page">
      <div className="space-y-3">
        <SkeletonBase className="h-8 w-64" />
        <SkeletonBase className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="neo-card space-y-4 p-6">
            <SkeletonBase className="h-6 w-40" />
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-5/6" />
            <SkeletonBase className="h-4 w-4/6" />
          </div>
          <div className="neo-card space-y-4 p-6">
            <SkeletonBase className="h-6 w-32" />
            <SkeletonBase className="aspect-video w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="neo-card space-y-4 p-6">
            <SkeletonBase className="h-5 w-24" />
            <SkeletonBase className="h-10 w-full" />
            <SkeletonBase className="h-10 w-full" />
            <SkeletonBase className="h-10 w-2/3" />
          </div>
          <div className="neo-card space-y-3 p-6">
            <SkeletonBase className="h-5 w-20" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBase className="h-8 w-8 rounded-full" />
                <SkeletonBase className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading page...</span>
    </div>
  )
}

interface SkeletonLoaderProps {
  variant?: 'product-card' | 'list-item' | 'table-row' | 'page'
  count?: number
  className?: string
}

function definedEntries(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

export function SkeletonLoader({
  variant = 'product-card',
  count = 1,
  className,
}: SkeletonLoaderProps) {
  const extra = definedEntries({ className })

  switch (variant) {
    case 'product-card':
      return <ProductGridSkeleton count={count} {...(extra as { className?: string })} />
    case 'list-item':
      return <ListSkeleton count={count} {...(extra as { className?: string })} />
    case 'table-row':
      return <TableSkeleton rows={count} {...(extra as { className?: string })} />
    case 'page':
      return <PageSkeleton {...(extra as { className?: string })} />
    default:
      return <ProductGridSkeleton count={count} {...(extra as { className?: string })} />
  }
}
