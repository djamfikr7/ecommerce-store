import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getProductReviews, createReview } from '@/lib/db-actions/reviews'
import { validateCreateReview, validateReviewListParams } from '@/lib/validators/reviews'

/**
 * GET /api/reviews
 * Get reviews for a product with pagination and statistics
 * Query params: productId, page, pageSize
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const params = {
      productId: searchParams.get('productId') || '',
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    }

    // Validate parameters
    const validation = validateReviewListParams(params)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    const { productId, page, pageSize } = validation.data

    // Fetch reviews
    const result = await getProductReviews(productId, page, pageSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reviews
 * Create a new review (auth required)
 * Body: { productId, rating, title?, content?, images? }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to create a review' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateCreateReview(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: validation.error.errors.map((e) => e.message).join(', '),
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Create review
    const review = await createReview(validation.data, session.user.id)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.name === 'DuplicateReviewError') {
        return NextResponse.json(
          { error: 'Duplicate review', message: error.message },
          { status: 409 }
        )
      }
      if (error.name === 'PurchaseRequiredError') {
        return NextResponse.json(
          { error: 'Purchase required', message: error.message },
          { status: 403 }
        )
      }
      if (error.name === 'ReviewNotFoundError') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
