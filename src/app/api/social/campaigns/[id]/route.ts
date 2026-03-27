/**
 * Campaign by ID API
 * GET /api/social/campaigns/[id] - Get a specific campaign
 * PATCH /api/social/campaigns/[id] - Update a campaign
 * DELETE /api/social/campaigns/[id] - Delete a campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from '@/lib/db-actions/social/campaigns'
import { updateCampaignSchema, validateOrThrow } from '@/lib/validators/social'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/social/campaigns/[id]
 * Get a specific campaign by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const campaign = await getCampaignById(id)

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    })
  } catch (error) {
    console.error('Failed to get campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get campaign' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/social/campaigns/[id]
 * Update a campaign (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const body = await request.json()
    const validated = validateOrThrow(updateCampaignSchema, body)

    const campaign = await updateCampaign(
      id,
      {
        name: validated.name,
        description: validated.description,
        platforms: validated.platforms,
        productIds: validated.productIds,
        goal: validated.goal,
        status: validated.status,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      },
      session.user.id
    )

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully',
    })
  } catch (error) {
    console.error('Failed to update campaign:', error)

    if (error instanceof Error && error.message === 'Campaign not found') {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social/campaigns/[id]
 * Delete a campaign (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params

    try {
      await deleteCampaign(id, session.user.id)
    } catch (error) {
      if (error instanceof Error && error.message === 'Campaign not found') {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
