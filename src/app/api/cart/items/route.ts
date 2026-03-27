import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateCart, addToCart } from '@/lib/db-actions/cart'
import { validateAddToCart } from '@/lib/validators/cart'
import { CartItemNotFoundError, InsufficientInventoryError } from '@/types/cart'
import { cookies } from 'next/headers'

const GUEST_CART_COOKIE = 'guest_cart_id'

/**
 * POST /api/cart/items
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateAddToCart(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { productId, variantId, quantity } = validation.data

    // Get or create cart
    const session = await getServerSession(authOptions)
    let cartId: string
    let cart: Awaited<ReturnType<typeof getOrCreateCart>> | null = null

    if (session?.user?.id) {
      cart = await getOrCreateCart(session.user.id)
      cartId = cart.id
    } else {
      // Guest cart
      const cookieStore = await cookies()
      let guestCartId = cookieStore.get(GUEST_CART_ID)?.value

      if (guestCartId) {
        const { getGuestCart } = await import('@/lib/db-actions/cart')
        cart = await getGuestCart(guestCartId)
      }

      if (!cart) {
        // Create new guest cart
        const { createGuestCart } = await import('@/lib/db-actions/cart')
        guestCartId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        cart = await createGuestCart(guestCartId)
        cookieStore.set(GUEST_CART_COOKIE, guestCartId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        })
      }

      cartId = cart.id
    }

    // Add item to cart
    const cartItem = await addToCart(cartId, {
      productId,
      variantId: variantId || null,
      quantity,
    })

    // Return updated cart
    const { getCart } = await import('@/lib/db-actions/cart')
    const updatedCart = await getCart(cartId)

    return NextResponse.json({
      success: true,
      cartItem,
      cart: updatedCart,
    })
  } catch (error) {
    console.error('Error adding to cart:', error)

    if (error instanceof CartItemNotFoundError) {
      return NextResponse.json(
        { error: 'Product not found', details: error.message },
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
      { error: 'Failed to add item to cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
