/**
 * CRON Job Definitions
 * Define all scheduled tasks for social media automation
 *
 * These jobs will be registered with a CRON service (e.g., Vercel Cron, Inngest)
 * See: https://vercel.com/docs/cron-jobs
 */

export const CRON_SECRET = process.env.CRON_SECRET || ''

/**
 * Process scheduled social posts
 * Runs every minute to publish due posts
 */
export const CRON_PROCESS_SCHEDULED_POSTS = 'process-scheduled-posts'
export const CRON_PROCESS_SCHEDULED_POSTS_SCHEDULE = '*/1 * * * *' // Every minute

/**
 * Sync social analytics
 * Runs every hour to update post metrics
 */
export const CRON_SYNC_ANALYTICS = 'sync-analytics'
export const CRON_SYNC_ANALYTICS_SCHEDULE = '0 * * * *' // Every hour

/**
 * Check for low stock alerts
 * Runs daily at 9am to alert about low inventory
 */
export const CRON_LOW_STOCK_ALERT = 'check-low-stock'
export const CRON_LOW_STOCK_ALERT_SCHEDULE = '0 9 * * *' // Every day at 9am

/**
 * Generate daily digest report
 * Runs daily at 6pm to send performance summary
 */
export const CRON_DAILY_DIGEST = 'daily-digest'
export const CRON_DAILY_DIGEST_SCHEDULE = '0 18 * * *' // Every day at 6pm

/**
 * Weekly engagement report
 * Runs every Monday at 9am
 */
export const CRON_WEEKLY_REPORT = 'weekly-report'
export const CRON_WEEKLY_REPORT_SCHEDULE = '0 9 * * 1' // Every Monday at 9am

/**
 * Sync social platform connections
 * Runs every 6 hours to refresh tokens
 */
export const CRON_SYNC_CONNECTIONS = 'sync-connections'
export const CRON_SYNC_CONNECTIONS_SCHEDULE = '0 */6 * * *' // Every 6 hours

/**
 * Clean up old failed posts
 * Runs daily at midnight to archive old failed posts
 */
export const CRON_CLEANUP_OLD_POSTS = 'cleanup-old-posts'
export const CRON_CLEANUP_OLD_POSTS_SCHEDULE = '0 0 * * *' // Every day at midnight

/**
 * All CRON jobs with their configurations
 */
export const CRON_JOBS = [
  {
    id: CRON_PROCESS_SCHEDULED_POSTS,
    schedule: CRON_PROCESS_SCHEDULED_POSTS_SCHEDULE,
    description: 'Process and publish scheduled social posts',
    path: '/api/automation/cron/process-scheduled-posts',
  },
  {
    id: CRON_SYNC_ANALYTICS,
    schedule: CRON_SYNC_ANALYTICS_SCHEDULE,
    description: 'Sync analytics from social platforms',
    path: '/api/automation/cron/sync-analytics',
  },
  {
    id: CRON_LOW_STOCK_ALERT,
    schedule: CRON_LOW_STOCK_ALERT_SCHEDULE,
    description: 'Check for low stock products and create alerts',
    path: '/api/automation/cron/check-low-stock',
  },
  {
    id: CRON_DAILY_DIGEST,
    schedule: CRON_DAILY_DIGEST_SCHEDULE,
    description: 'Generate daily performance digest',
    path: '/api/automation/cron/daily-digest',
  },
  {
    id: CRON_WEEKLY_REPORT,
    schedule: CRON_WEEKLY_REPORT_SCHEDULE,
    description: 'Generate weekly engagement report',
    path: '/api/automation/cron/weekly-report',
  },
  {
    id: CRON_SYNC_CONNECTIONS,
    schedule: CRON_SYNC_CONNECTIONS_SCHEDULE,
    description: 'Refresh social platform OAuth tokens',
    path: '/api/automation/cron/sync-connections',
  },
  {
    id: CRON_CLEANUP_OLD_POSTS,
    schedule: CRON_CLEANUP_OLD_POSTS_SCHEDULE,
    description: 'Clean up old failed posts',
    path: '/api/automation/cron/cleanup-old-posts',
  },
] as const

/**
 * Verify CRON request authentication
 */
export function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  // Vercel Cron sets this header automatically
  const vercelHeader = request.headers.get('x-vercel-cron')

  // Accept if Vercel cron header is present (Vercel handles security)
  if (vercelHeader) return true

  // Otherwise verify secret
  if (cronSecret === CRON_SECRET) return true
  if (authHeader?.startsWith('Bearer ') && authHeader.slice(7) === CRON_SECRET) return true

  return false
}

/**
 * Rate limiter for CRON jobs to prevent duplicate execution
 */
const processingJobs = new Set<string>()

export function acquireJobLock(jobId: string, ttlSeconds: number = 60): boolean {
  if (processingJobs.has(jobId)) {
    return false
  }
  processingJobs.add(jobId)

  // Auto-release after TTL
  setTimeout(() => {
    processingJobs.delete(jobId)
  }, ttlSeconds * 1000)

  return true
}

export function releaseJobLock(jobId: string): void {
  processingJobs.delete(jobId)
}

export default CRON_JOBS
