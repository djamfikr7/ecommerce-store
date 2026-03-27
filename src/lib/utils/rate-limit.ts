// Rate limiting utility for analytics endpoints
import { prisma } from '@/lib/prisma'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

// Get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return '127.0.0.1'
}

// Check rate limit for a given identifier
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    // Count recent requests
    const count = await prisma.analyticsEvent.count({
      where: {
        type: 'rate_limit_record',
        sessionId: endpoint,
        metadata: {
          path: ['ip', identifier],
        },
        createdAt: {
          gte: new Date(windowStart),
        },
      },
    })

    const remaining = Math.max(0, config.maxRequests - count)
    const success = count < config.maxRequests
    const resetAt = now + config.windowMs

    return { success, remaining, resetAt }
  } catch {
    // If rate limiting check fails, allow the request
    return {
      success: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    }
  }
}

// Record a rate limit hit
export async function recordRateLimitHit(
  identifier: string,
  endpoint: string
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventId: `rate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'rate_limit_record',
        sessionId: endpoint,
        metadata: {
          ip: identifier,
        },
      },
    })
  } catch {
    // Silently fail - don't block analytics recording
  }
}

// Simple in-memory rate limiter (fallback)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

export function simpleRateLimit(
  maxRequests: number,
  windowMs: number
): (identifier: string) => RateLimitResult {
  return (identifier: string) => {
    const now = Date.now()
    const entry = inMemoryStore.get(identifier)

    if (!entry || now > entry.resetAt) {
      inMemoryStore.set(identifier, { count: 1, resetAt: now + windowMs })
      return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs }
    }

    if (entry.count >= maxRequests) {
      return { success: false, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count++
    return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of inMemoryStore.entries()) {
    if (now > value.resetAt) {
      inMemoryStore.delete(key)
    }
  }
}, 60000) // Cleanup every minute
