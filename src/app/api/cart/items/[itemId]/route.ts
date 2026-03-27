import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateCartItem, removeFromCart } from '@/lib/db-actions/cart'
import { validateUpdateCartItem } from '@/lib/validators/cart'
import { CartItemNotFoundError, InsufficientInventoryError } from '@/types/cart'
import { cookies } from 'next/headers'

const GUEST_CART_COOKIE = 'guest_cart_id'

type RouteParams = { params: Promise<{ itemId: string }> }

/**
 * PATCH /api/cart/items/[itemId]
 * Update cart item quantity
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { itemId } = await params
    const body = await request.json()

    // Validate input
    const validation = validateUpdateCartItem({ itemId, ...body })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { quantity } = validation.data

    // Get cart ID
    const cartId = await getCartId()
    if (!cartId) {
      return NextResponse.json(
        { error: 'No cart found' },
        { status: 404 }
      )
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await removeFromCart(cartId, itemId)
      const { getCart } = await import('@/lib/db-actions/cart')
      const cart = await getCart(cartId)
      return NextResponse.json({ success: true, cart })
    }

    // Update quantity
    const cartItem = await updateCartItem(cartId, itemId, quantity)

    // Return updated cart
    const { getCart } = await import('@/lib/db-actions/cart')
    const cart = await getCart(cartId)

    return NextResponse.json({
      success: true,
      cartItem,
      cart,
    })
  } catch (error) {
    console.error('Error updating cart item:', error)

    if (error instanceof CartItemNotFoundError) {
      return NextResponse.json(
        { error: 'Cart item not found', details: error.message },
        { status: 404 }
      )
    }

    if (error instanceof InsufficientInventoryError) {
      return NextResponse.json(
        { error: 'Insufficient inventory', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update cart item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart/items/[itemId]
 * Remove item from cart
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { itemId } = await params

    // Get cart ID
    const cartId = await getCartId()
    if (!cartId) {
      return NextResponse.json(
        { error: 'No cart found' },
        { status: 404 }
      )
    }

    await removeFromCart(cartId, itemId)

    // Return updated cart
    const { getCart } = await import('@/lib/db-actions/cart')
    const cart = await getCart(cartId)

    return NextResponse.json({ success: true, cart })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Helper to get cart ID from session or cookie
 */
async function getCartId(): Promise<string | null> {
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    const { getOrCreateCart } = await import('@/lib/db-actions/cart')
    const cart = await getOrCreateCart(session.user.id)
    return cart.id
  }

  // Guest cart
  const cookieStore = await cookies()
  const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value

  if (guestCartId) {
    const { getGuestCart } = await import('@/lib/db-actions/cart')
    const cart = await getGuestCart(guestCartId)
    return cart?.id ?? null
  }

  return null
}
