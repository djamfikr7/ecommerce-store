import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  if (sessionId.startsWith('mock_session_')) {
    return NextResponse.json({ valid: true, mock: true })
  }

  // Real Stripe verification
  try {
    const { getCheckoutSession } = await import('@/lib/db-actions/checkout')
    const session = await getCheckoutSession(sessionId)
    return NextResponse.json({ valid: true, status: session.payment_status })
  } catch {
    return NextResponse.json({ valid: false }, { status: 404 })
  }
}
