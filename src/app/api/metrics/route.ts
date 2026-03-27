// GET /api/metrics - Prometheus metrics endpoint
import { NextResponse } from 'next/server'
import { register } from '@/lib/monitoring/metrics'

export async function GET() {
  try {
    // Get metrics in Prometheus format
    const metrics = await register.metrics()

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating metrics:', error)
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    )
  }
}

// Other methods not allowed
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
