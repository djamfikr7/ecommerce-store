import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/db-actions/products'
import { validateProductListParams } from '@/lib/validators/products'

/**
 * GET /api/products
 * Get paginated list of products with filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams

    const params = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      inStock: searchParams.get('inStock') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    }

    // Validate parameters
    const validation = validateProductListParams(params)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: validation.error.errors.map((e) => e.message).join(', '),
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Fetch products
    const result = await getProducts(validation.data)

    // Calculate total pages
    const totalPages = Math.ceil(result.total / result.pageSize)

    return NextResponse.json({
      products: result.products,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
