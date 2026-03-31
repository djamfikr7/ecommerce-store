import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getStripeBalance, getStripePayoutSchedule } from '@/lib/db-actions/admin/stripe'

// GET /api/admin/stripe/balance - Get Stripe balance
export async function GET() {
  try {
    // Verify admin session
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const searchParams = new URL(request?.url || '', 'http://localhost').searchParams
    const type = searchParams.get('type') || 'balance'

    if (type === 'payouts') {
      const payoutInfo = await getStripePayoutSchedule()
      return NextResponse.json({
        success: true,
        data: payoutInfo,
      })
    }

    const balance = await getStripeBalance()

    return NextResponse.json({
      success: true,
      data: balance,
    })
  } catch (error) {
    console.error('Error fetching Stripe balance:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch Stripe balance' },
      { status: 500 }
    )
  }
}
