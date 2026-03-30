'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchBar } from '@/components/search/search-bar'
import { SearchFiltersComponent } from '@/components/search/search-filters'
import { SearchResults } from '@/components/search/search-results'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { searchProductsFull, type SearchFilters } from '@/lib/actions/search'
import { getCategories } from '@/lib/db-actions/products'
import type { ProductCard, CategoryWithCount } from '@/types/shop'

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<ProductCard[]>([])
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort)
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.minRating) params.set('minRating', filters.minRating.toString())
    if (filters.inStock) params.set('inStock', 'true')

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl, { scroll: false })
  }, [query, filters, router])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setPage(1)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleSortChange = (sort: SearchFilters['sort']) => {
    const newFilters = { ...filters }
    if (sort) {
      newFilters.sort = sort
    } else {
      delete newFilters.sort
    }
    setFilters(newFilters)
    setPage(1)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="neo-card p-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for products..."
          autoFocus={!query}
        />
      </div>

      {/* Sort Options */}
      {query && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select
              value={filters.sort || 'relevance'}
              onChange={(e) => handleSortChange(e.target.value as SearchFilters['sort'])}
              className="neo-inset rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
          />
        </aside>

        {/* Results */}
        <main className="lg:col-span-3">
          <SearchResults products={products} isLoading={isLoading} query={query} total={total} />

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
