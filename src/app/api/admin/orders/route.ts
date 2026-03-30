import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { adminGetOrders } from '@/lib/db-actions/admin/orders'
import { validateAdminOrderList } from '@/lib/validators/admin'

// GET /api/admin/orders - List orders
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
      pageSize: searchParams.get('pageSize') || '20',
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
    }

    const validated = validateAdminOrderList(params)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = await adminGetOrders(validated.data)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
