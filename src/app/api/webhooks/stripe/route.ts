import { NextRequest, NextResponse } from 'next/server'
import { verifyAndConstructEvent, processWebhookEvent } from '@/lib/stripe/webhooks'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let eventId: string | undefined

  try {
    const event = await verifyAndConstructEvent(payload, signature)
    eventId = event.id

    const result = await processWebhookEvent(event)

    if (result.error) {
      console.error(`[Stripe Webhook] Processing error for ${eventId}: ${result.error}`)
    }

    return NextResponse.json({
      received: result.received,
      eventId: result.eventId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('signature') || message.includes('STRIPE_WEBHOOK_SECRET')) {
      console.error(`[Stripe Webhook] Verification failed: ${message}`)
      return NextResponse.json(
        { error: 'Webhook verification failed', details: message },
        { status: 400 },
      )
    }

    console.error(`[Stripe Webhook] Unexpected error${eventId ? ` for ${eventId}` : ''}:`, message)

    return NextResponse.json(
      { error: 'Webhook processing failed', details: message },
      { status: 500 },
    )
  }
}
