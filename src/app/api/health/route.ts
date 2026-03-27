// GET /api/health - Health check endpoint
import { NextRequest, NextResponse } from 'next/server'
import { performHealthCheck, livenessCheck, readinessCheck } from '@/lib/monitoring/health'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checkType = searchParams.get('type') || 'full'

  // Liveness probe - basic check if server is running
  if (checkType === 'live') {
    return NextResponse.json(livenessCheck(), {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  // Readiness probe - check if server can handle traffic
  if (checkType === 'ready') {
    const readiness = await readinessCheck()
    return NextResponse.json(readiness, {
      status: readiness.status === 'ok' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  // Full health check
  const startTime = Date.now()
  const health = await performHealthCheck()
  const responseTime = Date.now() - startTime

  // Log slow responses
  if (responseTime > 100) {
    console.warn(`Health check took ${responseTime}ms (>100ms threshold)`)
  }

  const statusCode = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Check-Duration': `${responseTime}ms`,
    },
  })
}

// Other methods not allowed
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
