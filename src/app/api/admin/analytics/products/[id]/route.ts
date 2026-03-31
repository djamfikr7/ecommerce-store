import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getProductAnalytics } from '@/lib/db-actions/admin/analytics'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/analytics/products/[id] - Get product analytics
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    const analytics = await getProductAnalytics(id)

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error('Error fetching product analytics:', error)

    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json(
        { error: 'Not Found', message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch product analytics' },
      { status: 500 }
    )
  }
}
