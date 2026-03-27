import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedProducts } from '@/lib/db-actions/products'

/**
 * GET /api/products/featured
 * Get featured products
 */
export async function GET(request: NextRequest) {
  try {
    // Parse limit from query params if provided
    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 8

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          error: 'Invalid limit',
          message: 'Limit must be a number between 1 and 50',
        },
        { status: 400 }
      )
    }

    // Fetch featured products
    const products = await getFeaturedProducts(limit)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
