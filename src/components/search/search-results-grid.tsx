'use client'

import { motion } from 'framer-motion'
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/products'

interface SearchResultsGridProps {
  products: ProductCardType[]
  isLoading?: boolean
  total?: number
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  className?: string
}

export function SearchResultsGrid({
  products,
  isLoading = false,
  total,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
}: SearchResultsGridProps) {
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = []

    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results header */}
      {!isLoading && total !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-slate-400">
            Showing{' '}
            <span className="font-medium text-slate-200">
              {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)}
            </span>{' '}
            of <span className="font-medium text-slate-200">{total.toLocaleString()}</span> products
          </p>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCardSkeleton variant="grid" />
              </motion.div>
            ))
          : products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <ProductCard product={product} variant="grid" />
              </motion.div>
            ))}
      </div>

      {/* Pagination */}
      {!isLoading && products.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage <= 1}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange?.(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ),
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
