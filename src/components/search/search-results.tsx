'use client'

import { motion } from 'framer-motion'
import { ProductCard } from '@/components/product/product-card'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/products'

interface SearchResultsProps {
  products: ProductCardType[]
  isLoading?: boolean
  query?: string
  total?: number
  className?: string
}

export function SearchResults({
  products,
  isLoading,
  query,
  total,
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
          <svg
            className="h-10 w-10 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-slate-100">No products found</h3>
        {query && (
          <p className="mb-6 text-slate-400">We couldn't find any products matching "{query}"</p>
        )}
        <p className="max-w-md text-sm text-slate-500">
          Try adjusting your search terms or filters to find what you're looking for
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results header */}
      {(query || total !== undefined) && (
        <div className="flex items-center justify-between">
          <div>
            {query && (
              <h2 className="text-lg font-semibold text-slate-100">Search results for "{query}"</h2>
            )}
            {total !== undefined && (
              <p className="mt-1 text-sm text-slate-400">
                {total} {total === 1 ? 'product' : 'products'} found
              </p>
            )}
          </div>
        </div>
      )}

      {/* Product grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
