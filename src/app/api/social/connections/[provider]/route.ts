/**
import { auth } from '@/lib/auth'
 * Social Connection by Provider API
 * DELETE /api/social/connections/[provider] - Disconnect a social account
 */

import { NextRequest, NextResponse } from 'next/server'

import { disconnectSocialAccount, getUserConnections } from '@/lib/db-actions/social/connections'
import { getProvider } from '@/lib/social/providers'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ provider: string }>
}

/**
 * GET /api/social/connections/[provider]
 * Check if user has connection with specific provider
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

    const { provider } = await params
    const connections = await getUserConnections(session.user.id)
    const connection = connections.find((c) => c.provider === provider)

    return NextResponse.json({
      success: true,
      data: {
        connected: !!connection,
        connection: connection || null,
      },
    })
  } catch (error) {
    console.error('Failed to check connection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check connection' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social/connections/[provider]
 * Disconnect a social media account
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { provider } = await params

    // Verify provider is supported
    const providerConfig = getProvider(provider)
    if (!providerConfig) {
      return NextResponse.json(
        { success: false, error: `Unsupported provider: ${provider}` },
        { status: 400 }
      )
    }

    await disconnectSocialAccount(session.user.id, provider)

    return NextResponse.json({
      success: true,
      message: `Successfully disconnected ${providerConfig.name} account`,
    })
  } catch (error) {
    console.error('Failed to disconnect social account:', error)

    if (error instanceof Error && error.message === 'Connection not found') {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to disconnect account' },
      { status: 500 }
    )
  }
}
