import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getDashboardStats } from '@/lib/db-actions/admin/dashboard'

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

    const stats = await getDashboardStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
