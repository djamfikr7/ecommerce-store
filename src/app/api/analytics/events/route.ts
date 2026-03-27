// POST /api/analytics/events - Record custom analytics events
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, productId, orderId, metadata } = body

    // Validate required fields
    if (!eventType) {
      return NextResponse.json(
        { error: 'Missing required field: eventType' },
        { status: 400 }
      )
    }

    // Get user session if available
    let userId: string | undefined
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      userId = session.user.id
    }

    // Generate session ID from cookie if available
    let sessionId: string | undefined
    const sessionCookie = request.cookies.get('session_id')
    if (sessionCookie?.value) {
      sessionId = sessionCookie.value
    }

    // Create analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        eventId: uuidv4(),
        type: eventType,
        userId,
        sessionId,
        productId,
        orderId,
        metadata: metadata || {},
      },
    })

    return NextResponse.json({
      success: true,
      eventId: event.eventId,
    })
  } catch (error) {
    console.error('Error recording event:', error)
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    )
  }
}

// GET is not supported for this endpoint
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
