import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters, ActiveFilterChips, type ActiveFilters } from '@/components/product/product-filters'
import { ProductSort } from '@/components/product/product-sort'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'
import type { ProductListParams, ProductCard, CategoryWithCount, ProductSortOption } from '@/types/products'

interface ProductsPageProps {
  searchParams: {
    category?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    minRating?: string
    inStock?: string
    sort?: string
    page?: string
  }
}

// Server-side data fetching (placeholder - will be replaced by phase3-backend-catalog)
async function getProducts(params: ProductListParams): Promise<{ products: ProductCard[]; total: number; page: number; pageSize: number; totalPages: number }> {
  // TODO: Replace with actual API call or database query
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${new URLSearchParams(params as any)}`)
  // return response.json()
  return {
    products: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
  }
}

async function getCategories(): Promise<CategoryWithCount[]> {
  // TODO: Replace with actual API call or database query
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?includeCount=true`)
  // return response.json()
  return []
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const title = searchParams.category
    ? `${searchParams.category} | Products`
    : searchParams.search
    ? `Search: ${searchParams.search} | Products`
    : 'All Products'

  const description = searchParams.category
    ? `Browse our collection of ${searchParams.category.toLowerCase()}.`
    : searchParams.search
    ? `Search results for "${searchParams.search}".`
    : 'Browse our complete product catalog.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/og-products.png'],
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Parse search params into filters
  const filters: ActiveFilters = {
    categories: searchParams.category ? [searchParams.category] : [],
    priceRange: [
      searchParams.minPrice ? parseInt(searchParams.minPrice) : 0,
      searchParams.maxPrice ? parseInt(searchParams.maxPrice) : 100000,
    ],
    minRating: searchParams.minRating ? parseInt(searchParams.minRating) : 0,
    inStockOnly: searchParams.inStock === 'true',
  }

  const sort = (searchParams.sort as ProductSortOption) || 'newest'
  const page = searchParams.page ? parseInt(searchParams.page) : 1

  // Fetch data
  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts({ ...filters, sort, page, pageSize: 12 }),
    getCategories(),
  ])

  // Build URL with updated params
  const buildUrl = (updates: Partial<ProductListParams>) => {
    const params = new URLSearchParams()
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.search) params.set('search', searchParams.search)
    if (updates.categories && updates.categories.length > 0) params.set('category', updates.categories[0])
    if (updates.priceRange) {
      params.set('minPrice', updates.priceRange[0].toString())
      params.set('maxPrice', updates.priceRange[1].toString())
    }
    if (updates.minRating) params.set('minRating', updates.minRating.toString())
    if (updates.inStockOnly) params.set('inStock', 'true')
    if (updates.sort) params.set('sort', updates.sort)
    if (updates.page && updates.page > 1) params.set('page', updates.page.toString())
    return `/products?${params.toString()}`
  }

  const pageTitle = searchParams.category
    ? categories.find((c) => c.slug === searchParams.category)?.name || 'Products'
    : searchParams.search
    ? `Search: ${searchParams.search}`
    : 'All Products'

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">{pageTitle}</h1>
          <p className="text-slate-400">
            {total > 0 ? `${total} products` : 'No products found'}
          </p>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6">
          <Button variant="outline" className="w-full neo-raised-sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Main content */}
        <div className="flex gap-8">
          {/* Filters sidebar - server wrapper for client component */}
          <div className="hidden lg:block">
            <ProductFilters
              filters={filters}
              onFilterChange={() => {}}
              categories={categories}
              priceBounds={{ min: 0, max: 100000 }}
            />
          </div>

          {/* Products section */}
          <div className="flex-1 min-w-0">
            {/* Sort and active filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <ActiveFilterChips
                filters={filters}
                categories={categories}
                onRemove={() => {}}
                onClearAll={() => {}}
              />
              <ProductSort value={sort} onChange={() => {}} />
            </div>

            {/* Product grid */}
            <Suspense fallback={<ProductGrid products={[]} isLoading />}>
              <ProductGrid
                products={products}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={() => {}}
              />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  )
}
