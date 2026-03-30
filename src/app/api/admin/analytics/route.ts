import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getSalesReport, getInventoryReport } from '@/lib/db-actions/admin/dashboard'
import { validateSalesReport } from '@/lib/validators/admin'

// GET /api/admin/analytics - Get sales and inventory reports
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

    const searchParams = request.nextUrl.searchParams
    const reportType = searchParams.get('type') || 'sales'

    if (reportType === 'inventory') {
      const inventory = await getInventoryReport()
      return NextResponse.json({
        success: true,
        data: inventory,
      })
    }

    // Default: sales report
    const params = {
      startDate: searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: searchParams.get('endDate') || new Date().toISOString(),
      groupBy: (searchParams.get('groupBy') as 'day' | 'week' | 'month') || 'day',
    }

    const validated = validateSalesReport(params)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const report = await getSalesReport(validated.data)

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
