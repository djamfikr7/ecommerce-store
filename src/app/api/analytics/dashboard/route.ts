// GET /api/analytics/dashboard - Get analytics dashboard data
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

import { getAnalyticsDashboard } from '@/lib/analytics/server'
import { AnalyticsPeriod } from '@/types/analytics'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for admin role (you may need to adjust this based on your user model)
    const userRole = (session.user as { role?: string }).role
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get period from query params
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') || '30d') as AnalyticsPeriod

    if (!['7d', '30d', '90d'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Use: 7d, 30d, or 90d' },
        { status: 400 }
      )
    }

    const dashboard = await getAnalyticsDashboard(period)

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics dashboard' },
      { status: 500 }
    )
  }
}

// POST is not supported for this endpoint
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
