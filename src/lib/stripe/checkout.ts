import stripe from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/email'
import { getOrCreateCustomer } from './customer'
import { addPrices, multiplyPrice } from '@/lib/currency'
import Stripe from 'stripe'

const SHIPPING_COST = 999

export interface CreateCheckoutParams {
  cartId: string
  userId?: string
  email?: string
  shippingAddressId?: string
  billingAddressId?: string
  notes?: string
  successUrl: string
  cancelUrl: string
  currency?: string
}

export interface CheckoutSessionResult {
  sessionId: string
  url: string
}

export async function createCheckoutSession(
  params: CreateCheckoutParams,
): Promise<CheckoutSessionResult> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  const cart = await prisma.cart.findUnique({
    where: { id: params.cartId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
          variant: true,
        },
      },
    },
  })

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty or not found')
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  for (const item of cart.items) {
    if (!item.product) continue

    const price = item.variant?.price ?? item.product.price
    const productName = item.variant
      ? `${item.product.name} - ${item.variant.name}`
      : item.product.name

    const imageUrl = item.product.images?.[0]?.url

    const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
      name: productName,
      metadata: {
        productId: item.productId ?? '',
        variantId: item.variantId ?? '',
      },
    }
    if (imageUrl) {
      productData.images = [imageUrl]
    }

    lineItems.push({
      price_data: {
        currency: (params.currency ?? cart.currency).toLowerCase(),
        product_data: productData,
        unit_amount: price,
      },
      quantity: item.quantity,
    })
  }

  let customer: Stripe.Customer | undefined
  if (params.userId && params.email) {
    try {
      customer = await getOrCreateCustomer(params.userId, params.email)
    } catch {
      console.warn('[Stripe Checkout] Failed to get/create customer, proceeding without')
    }
  }

  let shippingAddress: Record<string, string> | undefined
  let billingAddress: Record<string, string> | undefined

  if (params.shippingAddressId && params.userId) {
    const addr = await prisma.address.findUnique({
      where: { id: params.shippingAddressId },
    })
    if (addr) {
      shippingAddress = {
        firstName: addr.firstName,
        lastName: addr.lastName,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 ?? '',
        city: addr.city,
        state: addr.state ?? '',
        postalCode: addr.postalCode,
        country: addr.country,
        phone: addr.phone ?? '',
      }
    }
  }

  if (params.billingAddressId && params.userId) {
    const addr = await prisma.address.findUnique({
      where: { id: params.billingAddressId },
    })
    if (addr) {
      billingAddress = {
        firstName: addr.firstName,
        lastName: addr.lastName,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 ?? '',
        city: addr.city,
        state: addr.state ?? '',
        postalCode: addr.postalCode,
        country: addr.country,
        phone: addr.phone ?? '',
      }
    }
  }

  const metadata: Record<string, string> = {
    cartId: params.cartId,
    userId: params.userId ?? '',
    guestEmail: params.email ?? '',
    notes: params.notes ?? '',
  }

  if (shippingAddress) metadata.shippingAddress = JSON.stringify(shippingAddress)
  if (billingAddress) metadata.billingAddress = JSON.stringify(billingAddress)

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
            currency: (params.currency ?? cart.currency).toLowerCase(),
          },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 1499,
            currency: (params.currency ?? cart.currency).toLowerCase(),
          },
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 3 },
          },
        },
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  }

  if (params.email && !customer) {
    sessionParams.customer_email = params.email
  }

  if (customer) {
    sessionParams.customer = customer.id
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.id || !session.url) {
    throw new Error('Failed to create checkout session')
  }

  console.log(`[Stripe Checkout] Session created: ${session.id}`)

  return { sessionId: session.id, url: session.url }
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent', 'customer'],
  })
}

export async function expireCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  return stripe.checkout.sessions.expire(sessionId)
}

export async function listCheckoutSessions(params?: {
  customerId?: string
  status?: Stripe.Checkout.Session.Status
  limit?: number
}): Promise<Stripe.Checkout.Session[]> {
  if (!stripe) return []

  const listParams: Stripe.Checkout.SessionListParams = {
    limit: params?.limit ?? 10,
  }

  if (params?.customerId) listParams.customer = params.customerId
  if (params?.status) listParams.status = params.status

  const sessions = await stripe.checkout.sessions.list(listParams)
  return sessions.data
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<string> {
  console.log(`[Stripe Webhook] checkout.session.completed: ${session.id}`)

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id

  if (paymentIntentId) {
    const existing = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    })

    if (existing) {
      console.log(`[Stripe] Order already exists for session ${session.id}: ${existing.id}`)
      return existing.id
    }
  }

  const fullSession = await retrieveCheckoutSession(session.id)

  const cartId = fullSession.metadata?.cartId
  const userId = fullSession.metadata?.userId || null
  const notes = fullSession.metadata?.notes || null

  let shippingAddress: Record<string, unknown>
  let billingAddress: Record<string, unknown>

  try {
    shippingAddress = fullSession.metadata?.shippingAddress
      ? JSON.parse(fullSession.metadata.shippingAddress)
      : extractAddressFromStripe(fullSession)
    billingAddress = fullSession.metadata?.billingAddress
      ? JSON.parse(fullSession.metadata.billingAddress)
      : shippingAddress
  } catch {
    shippingAddress = extractAddressFromStripe(fullSession)
    billingAddress = shippingAddress
  }

  if (!fullSession.line_items?.data) {
    throw new Error('No line items in checkout session')
  }

  let subtotal = 0
  let shippingCost = 0
  const orderItems: Array<{
    productId: string
    variantId: string | null
    productName: string
    variantName: string | null
    sku: string
    price: number
    quantity: number
  }> = []

  for (const item of fullSession.line_items.data) {
    if (!item.price?.product || typeof item.price.product === 'string') continue

    const productData = item.price.product as Stripe.Product
    const metadata = productData.metadata || {}

    const productId = metadata.productId || ''
    const variantId = metadata.variantId || null

    const product = productId
      ? await prisma.product.findUnique({
          where: { id: productId },
          include: { images: true },
        })
      : null

    let variant = null
    if (variantId && product) {
      variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      })
    }

    const price = item.price.unit_amount || 0
    const quantity = item.quantity || 1
    subtotal = addPrices(subtotal, multiplyPrice(price, quantity))

    if (productData.name === 'Standard Shipping' || productData.name === 'Express Shipping') {
      shippingCost = addPrices(shippingCost, price)
    } else {
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

  const tax = Math.round(subtotal * 0.08)
  const total = addPrices(subtotal, addPrices(shippingCost, tax))

  const orderCount = await prisma.order.count()
  const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount + 1).padStart(4, '0')}`

  const isPaid =
    fullSession.payment_intent &&
    typeof fullSession.payment_intent !== 'string' &&
    fullSession.payment_intent.status === 'succeeded'

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: 'CONFIRMED',
        subtotal,
        shippingCost,
        tax,
        total,
        currency: fullSession.currency?.toUpperCase() ?? 'USD',
        shippingAddress: shippingAddress as any,
        billingAddress: billingAddress as any,
        paymentStatus: isPaid ? 'SUCCEEDED' : 'PROCESSING',
        stripePaymentIntentId: paymentIntentId ?? null,
        paymentMethod: 'CREDIT_CARD',
        notes,
      },
    })

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

    if (cartId) {
      await tx.cartItem.deleteMany({ where: { cartId } })
    }

    return newOrder
  })

  console.log(`[Stripe Checkout] Order created: ${order.orderNumber} (${order.id})`)

  sendOrderConfirmation(order.id).catch((err) =>
    console.error('[Stripe Checkout] Failed to send confirmation email:', err),
  )

  return order.id
}

function extractAddressFromStripe(session: Stripe.Checkout.Session): Record<string, unknown> {
  const raw = session as any
  const addr = raw.shipping_details?.address
  const name = raw.shipping_details?.name ?? ''

  return {
    firstName: name.split(' ')[0] ?? '',
    lastName: name.split(' ').slice(1).join(' ') ?? '',
    addressLine1: addr?.line1 ?? '',
    addressLine2: addr?.line2 ?? '',
    city: addr?.city ?? '',
    state: addr?.state ?? '',
    postalCode: addr?.postal_code ?? '',
    country: addr?.country ?? 'US',
    phone: raw.shipping_details?.phone ?? '',
  }
}
