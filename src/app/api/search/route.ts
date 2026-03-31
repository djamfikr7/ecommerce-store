import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/db-actions/products'

/**
 * GET /api/search
 * Search products by query with pagination
 * Query params:
 *   - q: search query (required, 1-200 chars)
 *   - page: page number (default: 1)
 *   - pageSize: items per page (default: 20, max: 100)
 *   - category: filter by category slug
 *   - minPrice: minimum price filter
 *   - maxPrice: maximum price filter
 *   - minRating: minimum rating filter (1-5)
 *   - inStock: filter in-stock items ('true'/'false')
 *   - sort: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query required', message: 'Query parameter "q" is required' },
        { status: 400 },
      )
    }

    if (q.length > 200) {
      return NextResponse.json(
        { error: 'Query too long', message: 'Search query must be 200 characters or fewer' },
        { status: 400 },
      )
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20),
    )
    const category = searchParams.get('category') || undefined
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
    const minRating = searchParams.get('minRating')
      ? Number(searchParams.get('minRating'))
      : undefined
    const inStockParam = searchParams.get('inStock')
    const inStock = inStockParam === 'true' ? true : inStockParam === 'false' ? false : undefined
    const sort =
      (searchParams.get('sort') as 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular') ||
      'newest'

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return NextResponse.json(
        { error: 'Invalid price range', message: 'minPrice must be <= maxPrice' },
        { status: 400 },
      )
    }

    const params: {
      search: string
      category?: string
      minPrice?: number
      maxPrice?: number
      minRating?: number
      inStock?: boolean
      sort: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
      page: number
      pageSize: number
    } = {
      search: q,
      sort,
      page,
      pageSize,
    }

    if (category) params.category = category
    if (minPrice !== undefined) params.minPrice = minPrice
    if (maxPrice !== undefined) params.maxPrice = maxPrice
    if (minRating !== undefined) params.minRating = minRating
    if (inStock !== undefined) params.inStock = inStock

    const result = await getProducts(params)

    return NextResponse.json({
      products: result.products,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize),
      query: q,
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
