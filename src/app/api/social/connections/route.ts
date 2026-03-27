/**
 * Social Connections API
 * GET /api/social/connections - Get user's social connections
 * POST /api/social/connections - Connect a new social account
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getUserConnections,
  connectSocialAccount,
  getSocialUserInfo,
} from '@/lib/db-actions/social/connections'
import { getProvider } from '@/lib/social/providers'
import { connectAccountSchema } from '@/lib/validators/social'

export const dynamic = 'force-dynamic'

/**
 * GET /api/social/connections
 * Get all connected social accounts for the current user
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

    const connections = await getUserConnections(session.user.id)

    return NextResponse.json({
      success: true,
      data: connections,
    })
  } catch (error) {
    console.error('Failed to get social connections:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get connections' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/connections
 * Connect a new social media account
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

    const body = await request.json()
    const validated = connectAccountSchema.parse(body)

    // Verify provider is supported
    const provider = getProvider(validated.provider)
    if (!provider) {
      return NextResponse.json(
        { success: false, error: `Unsupported provider: ${validated.provider}` },
        { status: 400 }
      )
    }

    // Verify token by fetching user info
    try {
      await getSocialUserInfo(validated.provider, validated.accessToken)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid access token' },
        { status: 401 }
      )
    }

    const connection = await connectSocialAccount(
      session.user.id,
      validated.provider,
      validated.accessToken,
      validated.refreshToken,
      validated.expiresAt ? new Date(validated.expiresAt) : undefined
    )

    return NextResponse.json({
      success: true,
      data: connection,
      message: `Successfully connected ${provider.name} account`,
    })
  } catch (error) {
    console.error('Failed to connect social account:', error)

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to connect account' },
      { status: 500 }
    )
  }
}
