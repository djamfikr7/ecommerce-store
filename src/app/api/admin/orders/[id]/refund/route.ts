import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminIssueRefund } from '@/lib/db-actions/admin/orders'
import { validateIssueRefund } from '@/lib/validators/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/orders/[id]/refund - Issue refund
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Verify admin session
    const session = await getServerSession(authOptions)

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

    const body = await request.json()
    const validated = validateIssueRefund(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = await adminIssueRefund(
      id,
      validated.data.amount,
      validated.data.reason,
      session.user.id
    )

    if (!result.success) {
      return NextResponse.json(
        { error: 'Refund Failed', message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error issuing refund:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to issue refund' },
      { status: 500 }
    )
  }
}
