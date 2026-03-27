import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters, ActiveFilterChips } from '@/components/product/product-filters'
import { ProductSort } from '@/components/product/product-sort'
import { Breadcrumb } from '@/components/product/breadcrumb'
import { Container } from '@/components/ui/container'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CategoryWithCount, ProductCard, ProductListParams, ProductSortOption } from '@/types/products'

interface CategoryPageProps {
  params: { slug: string }
  searchParams: {
    minPrice?: string
    maxPrice?: string
    minRating?: string
    inStock?: string
    sort?: string
    page?: string
  }
}

// Server-side data fetching (placeholder - will be replaced by phase3-backend-catalog)
async function getCategory(slug: string): Promise<CategoryWithCount | null> {
  // TODO: Replace with actual API call or database query
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`)
  // if (!response.ok) return null
  // return response.json()
  return null
}

async function getCategoryProducts(
  slug: string,
  params: ProductListParams
): Promise<{ products: ProductCard[]; total: number; page: number; pageSize: number; totalPages: number }> {
  // TODO: Replace with actual API call or database query
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?category=${slug}&${new URLSearchParams(params as any)}`)
  // return response.json()
  return {
    products: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
  }
}

async function getAllCategories(): Promise<CategoryWithCount[]> {
  // TODO: Replace with actual API call
  return []
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategory(params.slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} | Store`,
    description: category.description || `Browse our ${category.name.toLowerCase()} collection.`,
    openGraph: {
      title: `${category.name} | Store`,
      description: category.description || `Browse our ${category.name.toLowerCase()} collection.`,
      images: category.image ? [{ url: category.image }] : [],
    },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [category, categories] = await Promise.all([
    getCategory(params.slug),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

  // Parse search params
  const filters = {
    categories: [params.slug],
    priceRange: [
      searchParams.minPrice ? parseInt(searchParams.minPrice) : 0,
      searchParams.maxPrice ? parseInt(searchParams.maxPrice) : 100000,
    ],
    minRating: searchParams.minRating ? parseInt(searchParams.minRating) : 0,
    inStockOnly: searchParams.inStock === 'true',
  }

  const sort = (searchParams.sort as ProductSortOption) || 'newest'
  const page = searchParams.page ? parseInt(searchParams.page) : 1

  const { products, total, totalPages } = await getCategoryProducts(params.slug, {
    ...filters,
    sort,
    page,
    pageSize: 12,
  })

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: category.name, href: `/category/${category.slug}` },
  ]

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {/* Category header */}
        <div className="neo-card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {category.image && (
              <div className="w-24 h-24 rounded-xl overflow-hidden neo-raised-sm flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-slate-400 max-w-2xl">{category.description}</p>
              )}
              <p className="text-sm text-slate-500 mt-2">
                {total} products
              </p>
            </div>
          </div>
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
          {/* Filters sidebar */}
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
            <ProductGrid
              products={products}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={() => {}}
            />
          </div>
        </div>
      </Container>
    </div>
  )
}
