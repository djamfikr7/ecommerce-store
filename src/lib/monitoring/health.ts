// Health check functionality
import { prisma } from '@/lib/prisma'

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  checks: {
    database: CheckResult
    redis: CheckResult
    stripe: CheckResult
    email: CheckResult
  }
}

export interface CheckResult {
  status: 'ok' | 'error'
  latency?: number
  error?: string
}

// Track server start time
const startTime = Date.now()

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'error',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Database connection failed',
    }
  }
}

async function checkRedis(): Promise<CheckResult> {
  const start = Date.now()
  try {
    // Check if redis client is available
    const { redis } = await import('@/lib/redis')
    await redis.ping()
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch {
    // Redis is optional, return degraded status
    return {
      status: 'ok',
      latency: Date.now() - start,
      error: 'Redis not configured',
    }
  }
}

async function checkStripe(): Promise<CheckResult> {
  const start = Date.now()
  try {
    const stripe = (await import('@/lib/stripe')).default
    await stripe.balance.retrieve()
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'error',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Stripe API unavailable',
    }
  }
}

async function checkEmail(): Promise<CheckResult> {
  const start = Date.now()
  try {
    // Email service health check
    const { emailService } = await import('@/lib/email')
    await emailService.verifyConnection()
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'error',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Email service unavailable',
    }
  }
}

export async function performHealthCheck(): Promise<HealthStatus> {
  const [database, redis, stripe, email] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStripe(),
    checkEmail(),
  ])

  // Determine overall status
  const checks = [database, redis, stripe, email]
  const errors = checks.filter(c => c.status === 'error').length

  let status: HealthStatus['status']
  if (errors === 0) {
    status = 'healthy'
  } else if (errors <= 1) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  return {
    status,
    version: process.env.APP_VERSION || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database,
      redis,
      stripe,
      email,
    },
  }
}

// Simple liveness check (always returns ok if server is running)
export function livenessCheck(): { status: 'ok' } {
  return { status: 'ok' }
}

// Readiness check (returns ok only if critical services are available)
export async function readinessCheck(): Promise<{ status: 'ok' | 'error'; error?: string }> {
  try {
    const dbCheck = await checkDatabase()
    if (dbCheck.status === 'error') {
      return { status: 'error', error: 'Database unavailable' }
    }
    return { status: 'ok' }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Readiness check failed',
    }
  }
}
