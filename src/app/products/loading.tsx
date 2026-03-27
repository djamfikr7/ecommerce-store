import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters } from '@/components/product/product-filters'
import { ProductSort } from '@/components/product/product-sort'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

export default function ProductsLoading() {
  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Page header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-surface-elevated rounded-lg mb-2 shimmer" />
          <div className="h-5 w-32 bg-surface-elevated rounded-lg shimmer" />
        </div>

        {/* Mobile filter button skeleton */}
        <div className="lg:hidden mb-6">
          <div className="h-10 w-full bg-surface-elevated rounded-lg shimmer" />
        </div>

        {/* Main content skeleton */}
        <div className="flex gap-8">
          {/* Filters sidebar skeleton */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="neo-card p-6">
              <div className="h-6 w-20 bg-surface-overlay rounded-lg mb-6 shimmer" />
              <div className="space-y-6">
                {/* Category filter skeleton */}
                <div>
                  <div className="h-4 w-24 bg-surface-overlay rounded mb-3 shimmer" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-surface-overlay rounded shimmer" />
                        <div className="h-4 w-20 bg-surface-overlay rounded shimmer" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price filter skeleton */}
                <div>
                  <div className="h-4 w-28 bg-surface-overlay rounded mb-3 shimmer" />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="h-3 w-8 bg-surface-overlay rounded mb-1 shimmer" />
                      <div className="h-6 bg-surface-overlay rounded shimmer" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-8 bg-surface-overlay rounded mb-1 shimmer" />
                      <div className="h-6 bg-surface-overlay rounded shimmer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products section skeleton */}
          <div className="flex-1 min-w-0">
            {/* Sort skeleton */}
            <div className="flex justify-end mb-6">
              <div className="h-10 w-44 bg-surface-elevated rounded-lg shimmer" />
            </div>

            {/* Product grid skeleton */}
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="neo-card p-4 animate-pulse">
                  <div className="aspect-square rounded-xl bg-surface-overlay mb-4 shimmer" />
                  <div className="h-3 w-20 bg-surface-overlay rounded mb-2 shimmer" />
                  <div className="h-5 w-3/4 bg-surface-overlay rounded mb-2 shimmer" />
                  <div className="h-4 w-16 bg-surface-overlay rounded mb-3 shimmer" />
                  <div className="h-6 w-24 bg-surface-overlay rounded shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
