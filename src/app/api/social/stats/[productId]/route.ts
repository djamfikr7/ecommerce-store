/**
 * Product Social Stats API
 * GET /api/social/stats/[productId] - Get social stats for a product
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProductSocialStats } from '@/lib/db-actions/social/tracking'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ productId: string }>
}

/**
 * GET /api/social/stats/[productId]
 * Get social statistics for a product
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params

    const stats = await getProductSocialStats(productId)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Failed to get product social stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
