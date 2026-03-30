import stripe from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { handleCheckoutCompleted } from './checkout'
import { handleChargeRefunded } from './refunds'
import { handleCustomerCreated } from './customer'
import Stripe from 'stripe'

const EVENT_TTL_SECONDS = 86400

export interface WebhookResult {
  received: boolean
  eventId?: string
  error?: string
}

export async function verifyAndConstructEvent(
  payload: string,
  signature: string,
): Promise<Stripe.Event> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const key = `stripe:event:${eventId}`
  const existing = await redis.get(key)
  return existing !== null
}

async function markEventProcessed(eventId: string): Promise<void> {
  const key = `stripe:event:${eventId}`
  await redis.set(key, JSON.stringify({ processedAt: new Date().toISOString() }), {
    EX: EVENT_TTL_SECONDS,
  })
}

export async function processWebhookEvent(event: Stripe.Event): Promise<WebhookResult> {
  const eventId = event.id
  const eventType = event.type

  console.log(`[Stripe Webhook] Processing ${eventType} (${eventId})`)

  const alreadyProcessed = await isEventProcessed(eventId)
  if (alreadyProcessed) {
    console.log(`[Stripe Webhook] Event already processed: ${eventId}`)
    return { received: true, eventId }
  }

  try {
    switch (eventType) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`)
    }

    await markEventProcessed(eventId)

    console.log(`[Stripe Webhook] Successfully processed ${eventType} (${eventId})`)

    return { received: true, eventId }
  } catch (error) {
    console.error(
      `[Stripe Webhook] Error processing ${eventType} (${eventId}):`,
      error instanceof Error ? error.message : error,
    )

    return {
      received: true,
      eventId,
      error: error instanceof Error ? error.message : 'Unknown processing error',
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`[Stripe Webhook] payment_intent.succeeded: ${paymentIntent.id}`)

  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (!order) {
    console.log(
      `[Stripe] No order found for payment intent ${paymentIntent.id}, likely handled by checkout.session.completed`,
    )
    return
  }

  if (order.paymentStatus === 'SUCCEEDED') {
    console.log(`[Stripe] Order ${order.orderNumber} already marked as succeeded`)
    return
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'SUCCEEDED',
      status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
    },
  })

  console.log(`[Stripe] Order ${order.orderNumber} payment confirmed (payment_intent.succeeded)`)
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`[Stripe Webhook] payment_intent.payment_failed: ${paymentIntent.id}`)

  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (!order) {
    console.log(`[Stripe] No order found for failed payment intent: ${paymentIntent.id}`)
    return
  }

  if (order.paymentStatus === 'FAILED') {
    console.log(`[Stripe] Order ${order.orderNumber} already marked as failed`)
    return
  }

  const failureReason = paymentIntent.last_payment_error?.message ?? 'Unknown payment failure'

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'FAILED',
      status: 'CANCELLED',
    },
  })

  console.log(`[Stripe] Order ${order.orderNumber} payment failed: ${failureReason}`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log(`[Stripe Webhook] invoice.paid: ${invoice.id}`)

  const rawInvoice = invoice as any
  if (!rawInvoice.payment_intent) return

  const paymentIntentId =
    typeof rawInvoice.payment_intent === 'string'
      ? rawInvoice.payment_intent
      : rawInvoice.payment_intent.id

  if (!paymentIntentId) return

  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!order) {
    console.log(`[Stripe] No order found for invoice payment intent: ${paymentIntentId}`)
    return
  }

  if (order.paymentStatus === 'SUCCEEDED') {
    console.log(`[Stripe] Order ${order.orderNumber} already paid via invoice`)
    return
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'SUCCEEDED',
      status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
    },
  })

  console.log(`[Stripe] Order ${order.orderNumber} marked as paid (invoice.paid)`)
}

export function isWebhookEventType(eventType: string): boolean {
  const handledTypes = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.refunded',
    'invoice.paid',
    'customer.created',
  ]

  return handledTypes.includes(eventType)
}
