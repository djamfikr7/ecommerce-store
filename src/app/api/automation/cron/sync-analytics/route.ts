/**
 * POST /api/automation/cron/sync-analytics
 * CRON job: Sync analytics from social platforms
 *
 * Runs every hour via Vercel Cron or similar service
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncAllPostAnalytics } from '@/lib/social/automation/analytics-sync'
import { verifyCronSecret, acquireJobLock, releaseJobLock } from '@/lib/automation/crons'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify CRON authentication
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Acquire job lock to prevent duplicate execution
    const jobId = 'sync-analytics'
    if (!acquireJobLock(jobId, 3600)) {
      return NextResponse.json({
        success: true,
        message: 'Job already running, skipping',
        job: jobId,
      })
    }

    try {
      // Sync all post analytics
      const result = await syncAllPostAnalytics()

      const duration = Date.now() - startTime

      // Log the execution
      console.log(
        JSON.stringify({
          job: jobId,
          success: true,
          updated: result.updated,
          failed: result.failed,
          duration,
          timestamp: new Date().toISOString(),
        })
      )

      return NextResponse.json({
        success: true,
        job: jobId,
        postsUpdated: result.updated,
        failed: result.failed,
        duration,
      })
    } finally {
      // Release the job lock
      releaseJobLock(jobId)
    }
  } catch (error) {
    const duration = Date.now() - startTime

    console.error(
      JSON.stringify({
        job: 'sync-analytics',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: new Date().toISOString(),
      })
    )

    return NextResponse.json(
      {
        success: false,
        job: 'sync-analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 500 }
    )
  }
}

// Vercel Cron configuration
export const dynamic = 'force-dynamic'
export const maxDuration = 3600 // 1 hour max
