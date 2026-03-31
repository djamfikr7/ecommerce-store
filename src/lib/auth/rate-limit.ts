type RateLimitEntry = {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

function getStore(prefix: string): Map<string, RateLimitEntry> {
  if (!stores.has(prefix)) {
    stores.set(prefix, new Map())
  }
  return stores.get(prefix)!
}

function cleanup(store: Map<string, RateLimitEntry>, now: number) {
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
  prefix = 'default',
): RateLimitResult {
  const store = getStore(prefix)
  const now = Date.now()

  if (store.size > 10000) {
    cleanup(store, now)
  }

  const existing = store.get(key)

  if (!existing || now > existing.resetTime) {
    const resetTime = now + config.windowMs
    store.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: config.maxRequests - 1, resetTime }
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime,
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

export const RATE_LIMITS = {
  AUTH: { windowMs: 60_000, maxRequests: 100 },
  GENERAL: { windowMs: 60_000, maxRequests: 300 },
  LOGIN: { windowMs: 15 * 60_000, maxRequests: 10 },
  REGISTER: { windowMs: 60 * 60_000, maxRequests: 5 },
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitPreset = keyof typeof RATE_LIMITS

export function checkRateLimit(request: Request, preset: RateLimitPreset): RateLimitResult {
  const ip = getClientIp(request)
  return rateLimit(ip, RATE_LIMITS[preset], preset)
}
