'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Package, Grid3X3, LayoutList } from 'lucide-react'
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card'
import { cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/products'

interface ShopGridProps {
  products: ProductCardType[]
  isLoading?: boolean
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  columns?: 2 | 3 | 4
  emptyMessage?: string
}

export function ShopGrid({
  products,
  isLoading = false,
  viewMode = 'grid',
  onViewModeChange,
  columns = 3,
  emptyMessage = 'No products found matching your criteria. Try adjusting your filters or search terms.',
}: ShopGridProps) {
  const isEmpty = !isLoading && products.length === 0

  return (
    <div className="space-y-6">
      {/* View mode toggle */}
      {onViewModeChange && (
        <div className="flex items-center justify-between">
          <div className="neo-pressed-sm flex gap-1 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'rounded-lg p-2 transition-all duration-200',
                viewMode === 'grid'
                  ? 'neo-raised-sm bg-accent-primary text-white'
                  : 'text-slate-400 hover:text-slate-100',
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'rounded-lg p-2 transition-all duration-200',
                viewMode === 'list'
                  ? 'neo-raised-sm bg-accent-primary text-white'
                  : 'text-slate-400 hover:text-slate-100',
              )}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {viewMode === 'grid' ? (
        <div
          className={cn(
            'grid gap-6',
            'grid-cols-1',
            'sm:grid-cols-2',
            columns === 2 && 'lg:grid-cols-2',
            columns === 3 && 'lg:grid-cols-2 xl:grid-cols-3',
            columns === 4 && 'lg:grid-cols-3 xl:grid-cols-4',
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
                  layout
                >
                  <ProductCard product={product} variant="grid" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-list-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCardSkeleton variant="list" />
                  </motion.div>
                ))}
              </>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  layout
                >
                  <ProductCard product={product} variant="list" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-card rounded-2xl p-12 text-center"
        >
          <div className="neo-raised mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-slate-100">No products found</h3>
          <p className="mx-auto max-w-md text-slate-400">{emptyMessage}</p>
        </motion.div>
      )}
    </div>
  )
}
