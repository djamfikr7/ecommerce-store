import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { addToWishlist } from '@/lib/db-actions/wishlist'
import { z } from 'zod'

/**
 * Schema for adding item to wishlist
 */
const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
})

/**
 * POST /api/wishlist/items
 * Add a product to wishlist (auth required)
 * Body: { productId, variantId? }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to add items to wishlist' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = addToWishlistSchema.safeParse(body)

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

    const { productId, variantId } = validation.data

    // Add to wishlist
    const item = await addToWishlist(session.user.id, productId, variantId)

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error adding to wishlist:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        )
      }
      if (error.message === 'Product is not available') {
        return NextResponse.json(
          { error: 'Product unavailable', message: error.message },
          { status: 400 }
        )
      }
      if (error.message === 'Product variant not found') {
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
