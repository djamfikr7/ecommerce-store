import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateCart, getGuestCart, createGuestCart, getCartItemCount } from '@/lib/db-actions/cart'
import { cookies } from 'next/headers'

const GUEST_CART_COOKIE = 'guest_cart_id'

/**
 * GET /api/cart
 * Get current user's cart or guest cart
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      // Logged-in user
      const cart = await getOrCreateCart(session.user.id)
      return NextResponse.json({ cart })
    }

    // Guest user - get cart from cookie
    const cookieStore = await cookies()
    const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value

    if (guestCartId) {
      const cart = await getGuestCart(guestCartId)
      if (cart) {
        return NextResponse.json({ cart })
      }
    }

    // No cart exists for guest
    return NextResponse.json({ cart: null })
  } catch (error) {
    console.error('Error getting cart:', error)
    return NextResponse.json(
      { error: 'Failed to get cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cart
 * Create a new guest cart
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    // If user is logged in, return their existing cart
    if (session?.user?.id) {
      const cart = await getOrCreateCart(session.user.id)
      return NextResponse.json({ cart })
    }

    // Create guest cart
    const cartId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const cart = await createGuestCart(cartId)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set(GUEST_CART_COOKIE, cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return NextResponse.json({ cart }, { status: 201 })
  } catch (error) {
    console.error('Error creating cart:', error)
    return NextResponse.json(
      { error: 'Failed to create cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
