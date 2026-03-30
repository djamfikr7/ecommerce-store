import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import {
  getRecommendationsForUser,
  getRecommendationsForProduct,
  getTrendingProducts,
  getRecentlyViewedProducts,
  getHomepageRecommendations,
} from '@/lib/db-actions/recommendations'

/**
 * GET /api/recommendations
 * Get product recommendations
 * Query params:
 *   - type: 'user' | 'product' | 'trending' | 'recently-viewed' | 'homepage'
 *   - productId: string (required for type='product')
 *   - limit: number (default: 10)
 *   - days: number (for trending, default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const type = searchParams.get('type') || 'trending'
    const productId = searchParams.get('productId') || undefined
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Validate type
    const validTypes = ['user', 'product', 'trending', 'recently-viewed', 'homepage']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: 'Invalid type',
          message: `Type must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 50',
        },
        { status: 400 }
      )
    }

    // Check authentication for personalized recommendations
    const session = await auth()
    const userId = session?.user?.id

    let recommendations: unknown

    switch (type) {
      case 'user':
        if (!userId) {
          // Return trending for unauthenticated users
          recommendations = await getTrendingProducts(limit, days)
        } else {
          recommendations = await getRecommendationsForUser(userId, limit)
        }
        break

      case 'product':
        if (!productId) {
          return NextResponse.json(
            {
              error: 'Product ID required',
              message: 'productId is required when type is "product"',
            },
            { status: 400 }
          )
        }
        recommendations = await getRecommendationsForProduct(productId, limit)
        break

      case 'trending':
        recommendations = await getTrendingProducts(limit, days)
        break

      case 'recently-viewed':
        if (!userId) {
          return NextResponse.json(
            {
              error: 'Authentication required',
              message: 'You must be logged in to view recently viewed products',
            },
            { status: 401 }
          )
        }
        recommendations = await getRecentlyViewedProducts(userId, limit)
        break

      case 'homepage':
        recommendations = await getHomepageRecommendations(userId, limit)
        break

      default:
        recommendations = await getTrendingProducts(limit, days)
    }

    return NextResponse.json({
      type,
      recommendations,
      limit,
      ...(productId && { productId }),
      ...(days && type === 'trending' && { days }),
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
