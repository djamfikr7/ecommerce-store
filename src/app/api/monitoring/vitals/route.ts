/**
 * Web Vitals Reporting API Endpoint
 * Receives and stores performance metrics from the client
 */

import { NextRequest, NextResponse } from 'next/server'

interface VitalsPayload {
  metric?: {
    id: string
    name: string
    value: number
    rating: string
    delta: number
    navigationType: string
    timestamp: number
  }
  metrics?: Array<{
    name: string
    value: number
    unit: string
    timestamp: number
    metadata?: Record<string, unknown>
  }>
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
    usagePercent: number
  } | null
  url?: string
  userAgent?: string
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  } | null
  timestamp?: number
}

export async function POST(request: NextRequest) {
  try {
    const data: VitalsPayload = await request.json()

    // Log metrics (in production, send to analytics service)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Metrics]', {
        metric: data.metric,
        url: data.url,
        connection: data.connection,
        memory: data.memory,
      })
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      await sendToAnalytics(data)
    }

    // Store in database for historical analysis
    await storeMetrics(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process vitals:', error)
    return NextResponse.json({ error: 'Failed to process metrics' }, { status: 500 })
  }
}

/**
 * Send metrics to analytics service (Google Analytics, Datadog, etc.)
 */
async function sendToAnalytics(data: VitalsPayload) {
  // Example: Send to Google Analytics 4
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && data.metric) {
    try {
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: 'anonymous',
            events: [
              {
                name: 'web_vitals',
                params: {
                  metric_name: data.metric.name,
                  metric_value: data.metric.value,
                  metric_rating: data.metric.rating,
                  metric_delta: data.metric.delta,
                },
              },
            ],
          }),
        },
      )
    } catch (error) {
      console.error('Failed to send to Google Analytics:', error)
    }
  }

  // Example: Send to custom analytics endpoint
  if (process.env.ANALYTICS_ENDPOINT) {
    try {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ANALYTICS_API_KEY}`,
        },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Failed to send to analytics endpoint:', error)
    }
  }
}

/**
 * Store metrics in database for historical analysis
 */
async function storeMetrics(data: VitalsPayload) {
  // In a real application, store in database
  // Example with Prisma:
  /*
  if (data.metric) {
    await prisma.performanceMetric.create({
      data: {
        name: data.metric.name,
        value: data.metric.value,
        rating: data.metric.rating,
        url: data.url || '',
        userAgent: data.userAgent || '',
        timestamp: new Date(data.metric.timestamp),
      },
    });
  }
  */

  // For now, just log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Metrics Stored]', {
      metric: data.metric?.name,
      value: data.metric?.value,
      rating: data.metric?.rating,
    })
  }
}
