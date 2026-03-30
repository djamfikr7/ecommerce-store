import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getStripeTransactionHistory } from '@/lib/db-actions/admin/stripe'
import { validateStripeTransaction } from '@/lib/validators/admin'

// GET /api/admin/stripe/transactions - Get Stripe transaction history
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '50',
      startingAfter: searchParams.get('startingAfter') || undefined,
      endingBefore: searchParams.get('endingBefore') || undefined,
    }

    const validated = validateStripeTransaction(params)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const transactions = await getStripeTransactionHistory({
      limit: validated.data.pageSize,
      startingAfter: validated.data.startingAfter,
      endingBefore: validated.data.endingBefore,
    })

    return NextResponse.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    console.error('Error fetching Stripe transactions:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch Stripe transactions' },
      { status: 500 }
    )
  }
}
