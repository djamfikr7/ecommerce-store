import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/db-actions/checkout'
import { getCart } from '@/lib/db-actions/cart'
import { validateCheckoutSession } from '@/lib/validators/cart'
import { EmptyCartError } from '@/types/cart'
import { cookies } from 'next/headers'

const GUEST_CART_COOKIE = 'guest_cart_id'

/**
 * POST /api/checkout
 * Create Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateCheckoutSession(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { cartId, returnUrl, cancelUrl } = validation.data

    // Get cart
    const cart = await getCart(cartId)
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cannot checkout with an empty cart' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)

    // Prepare checkout data
    const checkoutData = {
      shippingAddressId: body.shippingAddressId,
      billingAddressId: body.billingAddressId,
      email: body.email || (session?.user?.email ?? undefined),
      notes: body.notes,
    }

    // Create checkout session
    const { sessionId, url } = await createCheckoutSession(cartId, checkoutData)

    return NextResponse.json({
      sessionId,
      url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    if (error instanceof EmptyCartError) {
      return NextResponse.json(
        { error: 'Cannot checkout with an empty cart' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
