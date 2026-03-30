import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { removeFromWishlist, moveToCart } from '@/lib/db-actions/wishlist'
import { z } from 'zod'

/**
 * Schema for move to cart request
 */
const moveToCartSchema = z.object({
  quantity: z.number().int().min(1).default(1),
})

/**
 * DELETE /api/wishlist/items/[itemId]
 * Remove an item from wishlist (auth required)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params

    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to remove items from wishlist' },
        { status: 401 }
      )
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'Invalid parameters', message: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Remove from wishlist
    await removeFromWishlist(session.user.id, itemId)

    return NextResponse.json({ success: true, message: 'Item removed from wishlist' })
  } catch (error) {
    console.error('Error removing from wishlist:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.name === 'WishlistItemNotFoundError') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        )
      }
      if (error.name === 'UnauthorizedWishlistAccessError') {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
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

/**
 * POST /api/wishlist/items/[itemId]
 * Move wishlist item to cart (auth required)
 * Body: { quantity?: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params

    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to move items to cart' },
        { status: 401 }
      )
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'Invalid parameters', message: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Parse request body
    let quantity = 1
    try {
      const body = await request.json()
      const validation = moveToCartSchema.safeParse(body)
      if (validation.success) {
        quantity = validation.data.quantity
      }
    } catch {
      // Use default quantity if body parsing fails
    }

    // Move to cart
    const cartItem = await moveToCart(session.user.id, itemId, quantity)

    return NextResponse.json({
      success: true,
      message: 'Item moved to cart',
      cartItem,
    })
  } catch (error) {
    console.error('Error moving to cart:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.name === 'WishlistItemNotFoundError') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        )
      }
      if (error.name === 'UnauthorizedWishlistAccessError') {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
        )
      }
      if (error.name === 'ProductOutOfStockError') {
        return NextResponse.json(
          { error: 'Out of stock', message: error.message },
          { status: 400 }
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
