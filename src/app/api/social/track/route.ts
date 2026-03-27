/**
 * Social Tracking API
 * POST /api/social/track - Track a social share/click event
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  trackSocialClick,
  trackSocialClickEvent,
  getProductSocialStats,
} from '@/lib/db-actions/social/tracking'
import { trackClickSchema, validateOrThrow } from '@/lib/validators/social'

export const dynamic = 'force-dynamic'

/**
 * POST /api/social/track
 * Track a social click or share event
 *
 * Body:
 * - platform: string (required)
 * - productId: string (required)
 * - type: 'share' | 'click' (default: 'click')
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const body = await request.json()
    const validated = validateOrThrow(trackClickSchema, body)

    const type = body.type || 'click'

    let tracking
    if (type === 'share') {
      tracking = await trackSocialClick(
        validated.platform,
        validated.productId,
        userId,
        request
      )
    } else {
      tracking = await trackSocialClickEvent(
        validated.platform,
        validated.productId,
        userId,
        request
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        clickId: tracking.clickId,
        tracked: true,
      },
    })
  } catch (error) {
    console.error('Failed to track social event:', error)

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
