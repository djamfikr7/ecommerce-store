'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShopFilters,
  ActiveFilterChips,
  MobileFilterButton,
  type ShopFilters as ShopFiltersType,
} from '@/components/shop/shop-filters'
import { ShopGrid } from '@/components/shop/shop-grid'
import { ShopSort, type ShopSortOption } from '@/components/shop/shop-sort'
import { Pagination, LoadMore } from '@/components/shop/pagination'
import { getProducts, getCategories } from '@/lib/db-actions/products'
import type { ProductCard, CategoryWithCount } from '@/types/products'

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<ProductCard[]>([])
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [useLoadMore, setUseLoadMore] = useState(false)

  const [filters, setFilters] = useState<ShopFiltersType>({
    categories: searchParams.get('category')?.split(',').filter(Boolean) || [],
    priceRange: [
      parseInt(searchParams.get('minPrice') || '0'),
      parseInt(searchParams.get('maxPrice') || '100000'),
    ],
    minRating: parseInt(searchParams.get('minRating') || '0'),
    inStockOnly: searchParams.get('inStock') === 'true',
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
  })

  const [sortBy, setSortBy] = useState<ShopSortOption>(
    (searchParams.get('sort') as ShopSortOption) || 'newest',
  )

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Load products when filters change
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      try {
        const params: {
          sort: ShopSortOption
          page: number
          pageSize: number
          search?: string
          category?: string
          minPrice?: number
          maxPrice?: number
          minRating?: number
          inStock?: boolean
        } = {
          sort: sortBy,
          page: currentPage,
          pageSize: 20,
        }

        if (searchQuery) params.search = searchQuery
        if (filters.categories.length > 0) params.category = filters.categories[0] as string
        if (filters.priceRange[0] > 0) params.minPrice = filters.priceRange[0]
        if (filters.priceRange[1] < 100000) params.maxPrice = filters.priceRange[1]
        if (filters.minRating > 0) params.minRating = filters.minRating
        if (filters.inStockOnly) params.inStock = true

        const result = await getProducts(params)

        if (useLoadMore && currentPage > 1) {
          setProducts((prev) => [...prev, ...result.products])
        } else {
          setProducts(result.products)
        }
        setTotalPages(Math.ceil(result.total / result.pageSize))
        setTotalItems(result.total)
      } catch (error) {
        console.error('Failed to load products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [filters, sortBy, currentPage, searchQuery, useLoadMore])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (filters.categories.length > 0) params.set('category', filters.categories.join(','))
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString())
    if (filters.priceRange[1] < 100000) params.set('maxPrice', filters.priceRange[1].toString())
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString())
    if (filters.inStockOnly) params.set('inStock', 'true')
    if (filters.brands.length > 0) params.set('brands', filters.brands.join(','))
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (currentPage > 1) params.set('page', currentPage.toString())

    const queryString = params.toString()
    router.replace(`/shop${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    })
  }, [filters, sortBy, currentPage, searchQuery, router])

  const handleFilterChange = useCallback((newFilters: ShopFiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  const handleSortChange = useCallback((newSort: ShopSortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleLoadMore = useCallback(() => {
    setUseLoadMore(true)
    setCurrentPage((prev) => prev + 1)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleRemoveFilter = (type: string, value?: string) => {
    const newFilters = { ...filters }

    switch (type) {
      case 'category':
        newFilters.categories = newFilters.categories.filter((c) => c !== value)
        break
      case 'rating':
        newFilters.minRating = 0
        break
      case 'inStock':
        newFilters.inStockOnly = false
        break
      case 'price':
        newFilters.priceRange = [0, 100000]
        break
      case 'brand':
        newFilters.brands = newFilters.brands.filter((b) => b !== value)
        break
    }

    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleClearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 100000],
      minRating: 0,
      inStockOnly: false,
      brands: [],
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold text-slate-100">All Products</h1>
          <p className="text-slate-400">Discover our complete collection of premium products</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-pressed h-12 rounded-xl pl-12"
            />
          </form>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <p className="text-sm text-slate-400">
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  <span className="font-medium text-slate-100">{totalItems}</span> products found
                </>
              )}
            </p>
          </div>

          <ShopSort value={sortBy} onChange={handleSortChange} />
        </motion.div>

        {/* Active filters */}
        <ActiveFilterChips
          filters={filters}
          categories={categories}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Main content */}
        <div className="flex gap-8">
          {/* Filters sidebar */}
          <ShopFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            priceBounds={{ min: 0, max: 100000 }}
            isMobileOpen={isMobileFilterOpen}
            onMobileClose={() => setIsMobileFilterOpen(false)}
          />

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            <ShopGrid
              products={products}
              isLoading={isLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              columns={3}
            />

            {/* Pagination */}
            {!isLoading && products.length > 0 && (
              <div className="mt-8">
                {useLoadMore ? (
                  <LoadMore
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onLoadMore={handleLoadMore}
                    isLoading={isLoading}
                  />
                ) : (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={totalItems}
                    pageSize={20}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter button */}
        <MobileFilterButton
          activeFilterCount={activeFilterCount}
          onClick={() => setIsMobileFilterOpen(true)}
        />
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-10 w-48 rounded-lg bg-surface-elevated" />
              <div className="h-12 max-w-2xl rounded-xl bg-surface-elevated" />
              <div className="flex gap-8">
                <div className="hidden w-72 lg:block">
                  <div className="h-96 rounded-xl bg-surface-elevated" />
                </div>
                <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-surface-elevated" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  )
}
