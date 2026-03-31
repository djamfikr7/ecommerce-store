'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { SearchBar } from '@/components/search/search-bar'
import { SearchFiltersComponent } from '@/components/search/search-filters'
import { SearchResultsGrid } from '@/components/search/search-results-grid'
import { NoResults } from '@/components/search/no-results'
import { Button } from '@/components/ui/button'
import { searchProductsFull, getSearchSuggestions, type SearchFilters } from '@/lib/actions/search'
import { getCategories } from '@/lib/db-actions/products'
import type { ProductCard, CategoryWithCount } from '@/types/products'

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<ProductCard[]>([])
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>(() => {
    const initialFilters: SearchFilters = {
      sort: (searchParams.get('sort') as SearchFilters['sort']) || 'relevance',
    }

    const category = searchParams.get('category')
    if (category) initialFilters.category = category

    const minPrice = searchParams.get('minPrice')
    if (minPrice) initialFilters.minPrice = Number(minPrice)

    const maxPrice = searchParams.get('maxPrice')
    if (maxPrice) initialFilters.maxPrice = Number(maxPrice)

    const minRating = searchParams.get('minRating')
    if (minRating) initialFilters.minRating = Number(minRating)

    const inStock = searchParams.get('inStock')
    if (inStock === 'true') initialFilters.inStock = true

    return initialFilters
  })

  // Load categories
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  // Perform search
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setProducts([])
      setTotal(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const result = await searchProductsFull(query, filters, page, pageSize)
      setProducts(result.products)
      setTotal(result.total)
      setTotalPages(result.totalPages)

      // Fetch suggestions when no results
      if (result.total === 0) {
        const suggs = await getSearchSuggestions(query)
        setSuggestions(suggs)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setProducts([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [query, filters, page, pageSize])

  // Search when query or filters change
  useEffect(() => {
    performSearch()
  }, [performSearch])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort)
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.minRating) params.set('minRating', filters.minRating.toString())
    if (filters.inStock) params.set('inStock', 'true')
    if (page > 1) params.set('page', page.toString())

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl, { scroll: false })
  }, [query, filters, page, router])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setPage(1)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setPage(1)
  }

  const activeFilterCount = useMemo(
    () =>
      Object.keys(filters).filter(
        (key) => key !== 'sort' && filters[key as keyof SearchFilters] !== undefined,
      ).length,
    [filters],
  )

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neo-card p-6"
      >
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for products..."
          autoFocus={!query}
        />
      </motion.div>

      {/* Empty state: no query */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="neo-card p-12 text-center"
        >
          <div className="neo-raised mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated">
            <Search className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-100">Search our store</h2>
          <p className="mx-auto max-w-md text-slate-400">
            Enter a search term above to find products across our catalog of 10,000+ items.
          </p>
        </motion.div>
      )}

      {/* Results section */}
      {query && (
        <>
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4"
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
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <p className="text-sm text-slate-400">
                {isLoading
                  ? 'Searching...'
                  : `${total.toLocaleString()} ${total === 1 ? 'result' : 'results'} for "${query}"`}
              </p>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={filters.sort || 'relevance'}
                onChange={(e) => {
                  const val = e.target.value
                  setFilters({
                    ...filters,
                    sort: val as 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest',
                  })
                  setPage(1)
                }}
                className="neo-inset rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <SearchFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                isMobileOpen={isMobileFilterOpen}
                onMobileClose={() => setIsMobileFilterOpen(false)}
              />
            </aside>

            {/* Results */}
            <main className="min-w-0 lg:col-span-3">
              {isLoading || products.length > 0 ? (
                <SearchResultsGrid
                  products={products}
                  isLoading={isLoading}
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              ) : (
                <NoResults
                  query={query}
                  suggestions={suggestions}
                  onSuggestionClick={handleSuggestionClick}
                  onClearFilters={() => {
                    setFilters({ sort: 'relevance' })
                    setPage(1)
                  }}
                />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  )
}
