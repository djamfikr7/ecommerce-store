/**
 * Social Campaigns API
 * GET /api/social/campaigns - List campaigns
 * POST /api/social/campaigns - Create a new campaign (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createCampaign,
  getCampaigns,
} from '@/lib/db-actions/social/campaigns'
import {
  createCampaignSchema,
  campaignListSchema,
  validateOrThrow,
} from '@/lib/validators/social'

export const dynamic = 'force-dynamic'

/**
 * GET /api/social/campaigns
 * List all campaigns (filtered by user role)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') || undefined,
      platform: searchParams.get('platform') || undefined,
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    }

    const params = validateOrThrow(campaignListSchema, queryParams)
    const result = await getCampaigns(params)

    return NextResponse.json({
      success: true,
      data: {
        campaigns: result.campaigns,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    })
  } catch (error) {
    console.error('Failed to get campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get campaigns' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/campaigns
 * Create a new social campaign (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for admin role
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = validateOrThrow(createCampaignSchema, body)

    const campaign = await createCampaign(
      {
        name: validated.name,
        description: validated.description,
        platforms: validated.platforms,
        productIds: validated.productIds,
        goal: validated.goal,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      },
      session.user.id
    )

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
