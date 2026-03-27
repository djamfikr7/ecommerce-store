import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/db-actions/products'
import { validateSearchParams } from '@/lib/validators/products'

/**
 * GET /api/search
 * Search products by query string
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const limit = searchParams.get('limit')

    // Validate parameters
    const validation = validateSearchParams({ q, limit })

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

    // Search products
    const products = await searchProducts(validation.data.q, validation.data.limit)

    return NextResponse.json({
      products,
      count: products.length,
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
