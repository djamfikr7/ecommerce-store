// POST /api/analytics/vitals - Record Web Vitals data
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordWebVital } from '@/lib/monitoring/metrics'
import { getClientIp } from '@/lib/utils/rate-limit'
import { checkRateLimit, recordRateLimitHit } from '@/lib/utils/rate-limit'

const RATE_LIMIT = { windowMs: 60000, maxRequests: 10 } // 10 requests per minute

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimitCheck = await checkRateLimit(ip, 'vitals', RATE_LIMIT)

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const body = await request.json()
    const { name, value, rating, id, timestamp, url, userAgent } = body

    // Validate required fields
    if (!name || value === undefined || !id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value, id' },
        { status: 400 }
      )
    }

    // Store in database
    const event = await prisma.analyticsEvent.create({
      data: {
        eventId: id,
        type: 'custom_event',
        metadata: {
          vitalName: name,
          vitalValue: value,
          vitalRating: rating,
          url,
          userAgent,
          isWebVital: true,
        },
      },
    })

    // Update Prometheus metrics
    const metricName = name.toUpperCase()
    if (['CLS', 'FID', 'LCP', 'FCP', 'TTFB', 'INP'].includes(metricName)) {
      recordWebVital(metricName as 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP', value)
    }

    // Record rate limit hit
    await recordRateLimitHit(ip, 'vitals')

    return NextResponse.json({ success: true, eventId: event.eventId })
  } catch (error) {
    console.error('Error recording vital:', error)
    // Fail silently - don't return error to client
    return NextResponse.json({ success: true })
  }
}

// GET is not supported for this endpoint
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
