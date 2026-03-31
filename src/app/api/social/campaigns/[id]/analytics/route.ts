/**
import { auth } from '@/lib/auth'
 * Campaign Analytics API
 * GET /api/social/campaigns/[id]/analytics - Get analytics for a campaign
 */

import { NextRequest, NextResponse } from 'next/server'

import { getCampaignById, getCampaignAnalytics } from '@/lib/db-actions/social/campaigns'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/social/campaigns/[id]/analytics
 * Get analytics for a specific campaign
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify campaign exists
    const campaign = await getCampaignById(id)

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get analytics
    const analytics = await getCampaignAnalytics(id)

    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        campaignName: campaign.name,
        campaignStatus: campaign.status,
      },
    })
  } catch (error) {
    console.error('Failed to get campaign analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
