/**
 * POST /api/automation/cron/process-scheduled-posts
 * CRON job: Process and publish scheduled social posts
 *
 * Runs every minute via Vercel Cron or similar service
 */

import { NextRequest, NextResponse } from 'next/server'
import { processScheduledPosts } from '@/lib/social/automation/scheduler'
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
    const jobId = 'process-scheduled-posts'
    if (!acquireJobLock(jobId, 120)) {
      return NextResponse.json({
        success: true,
        message: 'Job already running, skipping',
        job: jobId,
      })
    }

    try {
      // Process scheduled posts
      const result = await processScheduledPosts()

      const duration = Date.now() - startTime

      // Log the execution
      console.log(
        JSON.stringify({
          job: jobId,
          success: true,
          published: result.published,
          failed: result.failed,
          skipped: result.skipped,
          duration,
          timestamp: new Date().toISOString(),
        })
      )

      return NextResponse.json({
        success: true,
        job: jobId,
        published: result.published,
        failed: result.failed,
        skipped: result.skipped,
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
        job: 'process-scheduled-posts',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: new Date().toISOString(),
      })
    )

    return NextResponse.json(
      {
        success: false,
        job: 'process-scheduled-posts',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 500 }
    )
  }
}

// Vercel Cron configuration
export const dynamic = 'force-dynamic'
export const maxDuration = 120 // 2 minutes max
