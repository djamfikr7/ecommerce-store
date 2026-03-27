import { NextRequest, NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/db-actions/checkout'

/**
 * POST /api/checkout/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const result = await handleWebhook(payload, sig)

  if (!result.received) {
    return NextResponse.json(
      { error: 'Webhook processing failed', details: result.error },
      { status: 400 }
    )
  }

  // Log any errors but still return 200 to prevent Stripe retries
  if (result.error) {
    console.error('Webhook processing error:', result.error)
  }

  return NextResponse.json({
    received: true,
    eventId: result.eventId,
  })
}

// Disable body parsing for webhook route
export const config = {
  api: {
    bodyParser: false,
  },
}
