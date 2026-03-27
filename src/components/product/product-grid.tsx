'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { ProductCard, ProductCardSkeleton } from './product-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/products'

interface ProductGridProps {
  products: ProductCardType[]
  isLoading?: boolean
  columns?: 2 | 3 | 4
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function ProductGrid({
  products,
  isLoading = false,
  columns = 3,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ProductGridProps) {
  const isEmpty = !isLoading && products.length === 0

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div
        className={cn(
          'grid gap-6',
          'grid-cols-1',
          'sm:grid-cols-2',
          'lg:grid-cols-2',
          'xl:grid-cols-3',
          columns === 4 && '2xl:grid-cols-4'
        )}
      >
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCardSkeleton variant="grid" />
                </motion.div>
              ))}
            </>
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <ProductCard product={product} variant="grid" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-elevated neo-raised flex items-center justify-center">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">No products found</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            We could not find any products matching your criteria. Try adjusting your filters or search terms.
          </p>
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && products.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
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
        </div>
      )}
    </div>
  )
}
