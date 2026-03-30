// GET /api/analytics/export - Export analytics data
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { ReportFormat } from '@/types/analytics'

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

    // Check for admin role
    const userRole = (session.user as { role?: string }).role
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'json') as ReportFormat
    const type = searchParams.get('type') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (dateFrom) dateFilter.gte = new Date(dateFrom)
    if (dateTo) dateFilter.lte = new Date(dateTo)

    // Fetch events
    const whereClause: { type?: string; createdAt?: { gte?: Date; lte?: Date } } = {}
    if (type !== 'all') {
      whereClause.type = type
    }
    if (dateFilter.gte || dateFilter.lte) {
      whereClause.createdAt = dateFilter
    }

    const events = await prisma.analyticsEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limit for performance
    })

    // Format based on requested type
    if (format === 'csv') {
      const headers = ['eventId', 'type', 'userId', 'productId', 'orderId', 'createdAt']
      const csvRows = [
        headers.join(','),
        ...events.map(e => [
          e.eventId,
          e.type,
          e.userId || '',
          e.productId || '',
          e.orderId || '',
          e.createdAt.toISOString(),
        ].join(','))
      ]

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${Date.now()}.csv"`,
        },
      })
    }

    // JSON format (default)
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      recordCount: events.length,
      filters: { type, dateFrom, dateTo },
      data: events.map(e => ({
        eventId: e.eventId,
        type: e.type,
        userId: e.userId,
        productId: e.productId,
        orderId: e.orderId,
        metadata: e.metadata,
        createdAt: e.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
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
