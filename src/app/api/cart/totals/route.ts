import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCartTotals } from '@/lib/db-actions/cart'
import { cookies } from 'next/headers'

const GUEST_CART_COOKIE = 'guest_cart_id'

/**
 * GET /api/cart/totals
 * Get cart totals (subtotal, tax, total)
 */
export async function GET() {
  try {
    const cartId = await getCartId()

    if (!cartId) {
      return NextResponse.json({
        totals: {
          subtotal: 0,
          itemCount: 0,
          estimatedTax: 0,
          total: 0,
        },
      })
    }

    const totals = await getCartTotals(cartId)

    return NextResponse.json({ totals })
  } catch (error) {
    console.error('Error getting cart totals:', error)
    return NextResponse.json(
      { error: 'Failed to get cart totals', details: error instanceof Error ? error.message : 'Unknown error' },
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
