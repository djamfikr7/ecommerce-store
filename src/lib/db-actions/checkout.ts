'use server'

import stripe, { getStripePublishableKey } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getCart, getCartTotals } from '@/lib/db-actions/cart'
import { CheckoutData, CheckoutSessionResponse, EmptyCartError } from '@/types/cart'
import { CreateOrderInput, AddressData } from '@/types/order'
import { addPrices, multiplyPrice } from '@/lib/currency'
import Stripe from 'stripe'

const SHIPPING_COST = 999 // $9.99 in cents (default shipping)

/**
 * Get Stripe publishable key for client
 */
export async function getStripePublishableKeyAction(): Promise<string> {
  return getStripePublishableKey()
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  cartId: string,
  data: CheckoutData
): Promise<CheckoutSessionResponse> {
  // Get cart with items
  const cart = await getCart(cartId)

  if (!cart || cart.items.length === 0) {
    throw new EmptyCartError()
  }

  // Build line items for Stripe
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  for (const item of cart.items) {
    if (!item.product) continue

    const price = item.variant?.price ?? item.product.price
    const productName = item.variant
      ? `${item.product.name} - ${item.variant.name}`
      : item.product.name

    // Get first image URL if available
    const imageUrl =
      item.variant?.images?.[0]?.url ||
      item.product.images?.[0]?.url ||
      undefined

    lineItems.push({
      price_data: {
        currency: cart.currency.toLowerCase(),
        product_data: {
          name: productName,
          images: imageUrl ? [imageUrl] : undefined,
          metadata: {
            productId: item.productId!,
            variantId: item.variantId ?? '',
          },
        },
        unit_amount: price,
      },
      quantity: item.quantity,
    })
  }

  // Get shipping address if logged in
  let shippingAddress: AddressData | undefined
  if (data.shippingAddressId && cart.userId) {
    const address = await prisma.address.findUnique({
      where: { id: data.shippingAddressId },
    })
    if (address) {
      shippingAddress = {
        firstName: address.firstName,
        lastName: address.lastName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      }
    }
  }

  // Get billing address if specified
  let billingAddress: AddressData | undefined
  if (data.billingAddressId && cart.userId) {
    const address = await prisma.address.findUnique({
      where: { id: data.billingAddressId },
    })
    if (address) {
      billingAddress = {
        firstName: address.firstName,
        lastName: address.lastName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      }
    }
  }

  // Build metadata
  const metadata: Record<string, string> = {
    cartId,
    userId: cart.userId ?? '',
    guestEmail: data.email ?? '',
    notes: data.notes ?? '',
  }

  if (shippingAddress) {
    metadata.shippingAddress = JSON.stringify(shippingAddress)
  }
  if (billingAddress) {
    metadata.billingAddress = JSON.stringify(billingAddress)
  }

  // Create Stripe checkout session
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'BE'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: SHIPPING_COST,
            currency: cart.currency.toLowerCase(),
          },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 5,
            },
            maximum: {
              unit: 'business_day',
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 1499, // $14.99
            currency: cart.currency.toLowerCase(),
          },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 2,
            },
            maximum: {
              unit: 'business_day',
              value: 3,
            },
          },
        },
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart?cancelled=true`,
    metadata,
    customer_email: data.email || (cart.userId ? undefined : undefined),
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })

  if (!session.id || !session.url) {
    throw new Error('Failed to create checkout session')
  }

  return {
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Get checkout session from Stripe
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  })

  return session
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhook(
  payload: string,
  sig: string
): Promise<{ received: boolean; eventId?: string; error?: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return { received: false, error: 'Webhook secret not configured' }
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return { received: false, error: 'Invalid signature' }
  }

  console.log(`Processing webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return { received: true, eventId: event.id }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return {
      received: true,
      eventId: event.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('Processing checkout completed:', session.id)

  // Check if order already exists (idempotency)
  const existingOrder = await prisma.order.findUnique({
    where: { stripePaymentIntentId: session.payment_intent as string },
  })

  if (existingOrder) {
    console.log('Order already exists for session:', session.id)
    return
  }

  // Create order from checkout session
  await createOrderFromCheckout(session.id)
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.error('Payment failed:', paymentIntent.id)

  // Log failure - could also update order status if order exists
  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'FAILED' },
    })
  }
}

/**
 * Create order from Stripe checkout session
 */
export async function createOrderFromCheckout(sessionId: string): Promise<string> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  })

  if (!session.line_items?.data) {
    throw new Error('No line items in checkout session')
  }

  const cartId = session.metadata?.cartId
  const userId = session.metadata?.userId || null
  const notes = session.metadata?.notes || null

  // Parse addresses from metadata
  let shippingAddress: AddressData
  let billingAddress: AddressData

  try {
    shippingAddress = session.metadata?.shippingAddress
      ? JSON.parse(session.metadata.shippingAddress)
      : {
          firstName: '',
          lastName: '',
          addressLine1: '',
          addressLine2: null,
          city: '',
          state: null,
          postalCode: '',
          country: session.shipping_details?.address?.country || 'US',
          phone: session.shipping_details?.phone || null,
        }

    billingAddress = session.metadata?.billingAddress
      ? JSON.parse(session.metadata.billingAddress)
      : shippingAddress
  } catch {
    // Fallback to shipping details from Stripe
    shippingAddress = {
      firstName: session.shipping_details?.address?.name?.split(' ')[0] || '',
      lastName: session.shipping_details?.address?.name?.split(' ').slice(1).join(' ') || '',
      addressLine1: session.shipping_details?.address?.line1 || '',
      addressLine2: session.shipping_details?.address?.line2,
      city: session.shipping_details?.address?.city || '',
      state: session.shipping_details?.address?.state,
      postalCode: session.shipping_details?.address?.postal_code || '',
      country: session.shipping_details?.address?.country || 'US',
      phone: session.shipping_details?.phone,
    }
    billingAddress = shippingAddress
  }

  // Calculate totals from line items
  let subtotal = 0
  let shippingCost = 0
  const orderItems: CreateOrderInput['items'] = []

  for (const item of session.line_items.data) {
    if (!item.price?.product || typeof item.price.product === 'string') continue

    const productData = item.price.product as Stripe.Product
    const metadata = productData.metadata || {}

    const productId = metadata.productId || ''
    const variantId = metadata.variantId || null

    // Fetch product to get current data
    const product = productId
      ? await prisma.product.findUnique({
          where: { id: productId },
          include: { images: true },
        })
      : null

    // Fetch variant if specified
    let variant = null
    if (variantId && product) {
      variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { images: true },
      })
    }

    const price = item.price.unit_amount || 0
    const quantity = item.quantity || 1
    subtotal = addPrices(subtotal, multiplyPrice(price, quantity))

    // Check if this is a shipping line item
    if (productData.name === 'Standard Shipping' || productData.name === 'Express Shipping') {
      shippingCost = addPrices(shippingCost, price)
    } else {
      // This is a product line item
      orderItems.push({
        productId,
        variantId,
        productName: product?.name || productData.name,
        variantName: variant?.name || null,
        sku: variant?.sku || product?.sku || '',
        price,
        quantity,
      })
    }
  }

  // Calculate tax (estimate from subtotal)
  const tax = Math.round(subtotal * 0.08)
  const total = addPrices(subtotal, addPrices(shippingCost, tax))

  // Generate order number
  const orderCount = await prisma.order.count()
  const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount + 1).padStart(4, '0')}`

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: 'CONFIRMED',
        subtotal,
        shippingCost,
        tax,
        total,
        currency: session.currency?.toUpperCase() || 'USD',
        shippingAddress,
        billingAddress,
        paymentStatus: session.payment_intent &&
          typeof session.payment_intent !== 'string' &&
          session.payment_intent.status === 'succeeded'
          ? 'SUCCEEDED'
          : 'PROCESSING',
        stripePaymentIntentId: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id,
        paymentMethod: 'CREDIT_CARD',
        notes,
      },
    })

    // Create order items
    for (const item of orderItems) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: multiplyPrice(item.price, item.quantity),
        },
      })

      // Update inventory
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      } else if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      }
    }

    // Clear cart if exists
    if (cartId) {
      await tx.cartItem.deleteMany({
        where: { cartId },
      })
    }

    return newOrder
  })

  console.log('Order created from checkout:', order.id)

  // Trigger async order confirmation email (fire and forget)
  sendOrderConfirmationEmail(order.id).catch((err) =>
    console.error('Failed to send order confirmation:', err)
  )

  return order.id
}

/**
 * Send order confirmation email (placeholder - integrate with email service)
 */
async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  })

  if (!order) return

  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  console.log(`[Email] Order confirmation would be sent for order ${order.orderNumber}`)
  console.log(`[Email] To: ${order.user?.email || 'guest'}`)
}
