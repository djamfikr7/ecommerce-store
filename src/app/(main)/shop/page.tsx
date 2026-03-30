'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters, type ActiveFilters } from '@/components/product/product-filters'
import { ActiveFilterChips } from '@/components/product/product-filters'
import { ProductSort } from '@/components/product/product-sort'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getProducts, getCategories } from '@/lib/db-actions/products'
import type { ProductCard, CategoryWithCount, ProductSortOption } from '@/types/shop'

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<ProductCard[]>([])
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))

  const [filters, setFilters] = useState<ActiveFilters>({
    categories: searchParams.get('category')?.split(',').filter(Boolean) || [],
    priceRange: [
      parseInt(searchParams.get('minPrice') || '0'),
      parseInt(searchParams.get('maxPrice') || '100000'),
    ],
    minRating: parseInt(searchParams.get('minRating') || '0'),
    inStockOnly: searchParams.get('inStock') === 'true',
  })

  const [sortBy, setSortBy] = useState<ProductSortOption>(
    (searchParams.get('sort') as ProductSortOption) || 'newest',
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
        const params: any = {
          sort: sortBy,
          page: currentPage,
          pageSize: 20,
        }

        if (searchQuery) params.search = searchQuery
        if (filters.categories.length > 0) params.category = filters.categories[0]
        if (filters.priceRange[0] > 0) params.minPrice = filters.priceRange[0]
        if (filters.priceRange[1] < 100000) params.maxPrice = filters.priceRange[1]
        if (filters.minRating > 0) params.minRating = filters.minRating
        if (filters.inStockOnly) params.inStock = true

        const result = await getProducts(params)

        setProducts(result.products)
        setTotalPages(Math.ceil(result.total / result.pageSize))
      } catch (error) {
        console.error('Failed to load products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [filters, sortBy, currentPage, searchQuery])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (filters.categories.length > 0) params.set('category', filters.categories.join(','))
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString())
    if (filters.priceRange[1] < 100000) params.set('maxPrice', filters.priceRange[1].toString())
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString())
    if (filters.inStockOnly) params.set('inStock', 'true')
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (currentPage > 1) params.set('page', currentPage.toString())

    router.replace(`/shop?${params.toString()}`, { scroll: false })
  }, [filters, sortBy, currentPage, searchQuery, router])

  const handleFilterChange = useCallback((newFilters: ActiveFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  const handleSortChange = useCallback((newSort: ProductSortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

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
          <p className="text-slate-400">Discover our complete collection</p>
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
              className="neo-pressed h-12 pl-12"
            />
          </form>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <p className="text-sm text-slate-400">
              {isLoading ? 'Loading...' : `${products.length} products`}
            </p>
          </div>

          <ProductSort value={sortBy} onChange={handleSortChange} />
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
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            priceBounds={{ min: 0, max: 100000 }}
            isMobileOpen={isMobileFilterOpen}
            onMobileClose={() => setIsMobileFilterOpen(false)}
          />

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              columns={3}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
