import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnalyticsEvents, trackEvent } from '@/lib/db-actions/admin/analytics'
import { validateAnalyticsQuery, validateTrackEvent } from '@/lib/validators/admin'

// GET /api/admin/analytics/events - Get analytics events
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '50',
      type: searchParams.get('type') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      userId: searchParams.get('userId') || undefined,
      sessionId: searchParams.get('sessionId') || undefined,
    }

    const validated = validateAnalyticsQuery(params)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = await getAnalyticsEvents(validated.data)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching analytics events:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch analytics events' },
      { status: 500 }
    )
  }
}

// POST /api/admin/analytics/events - Track an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validateTrackEvent(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const event = await trackEvent(validated.data)

    return NextResponse.json({
      success: true,
      data: event,
    }, { status: 201 })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to track event' },
      { status: 500 }
    )
  }
}
