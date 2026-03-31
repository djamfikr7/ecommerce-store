import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/types/auth'
import { rateLimit, getClientIp, RATE_LIMITS, type RateLimitPreset } from '@/lib/auth/rate-limit'

// ─── Rate Limiting ───────────────────────────────────────────────

export function withRateLimit(preset: RateLimitPreset = 'AUTH') {
  return function (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) {
    return async function (req: NextRequest): Promise<NextResponse> {
      const ip = getClientIp(req)
      const result = rateLimit(ip, RATE_LIMITS[preset], preset)

      if (!result.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(result.resetTime),
            },
          },
        )
      }

      const response = await handler(req)
      response.headers.set('X-RateLimit-Remaining', String(result.remaining))
      response.headers.set('X-RateLimit-Reset', String(result.resetTime))
      return response
    }
  }
}

// ─── CSRF Protection ─────────────────────────────────────────────

const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'

function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function getCsrfToken(): string {
  return generateCsrfToken()
}

export function setCsrfToken(response: NextResponse): NextResponse {
  const token = generateCsrfToken()
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return response
}

export function validateCsrfToken(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true

  const headerToken = req.headers.get(CSRF_HEADER)
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value

  if (!headerToken || !cookieToken) return false
  if (headerToken !== cookieToken) return false

  return true
}

export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const method = req.method.toUpperCase()

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (!validateCsrfToken(req)) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
      }
    }

    return handler(req)
  }
}

// ─── Auth Required ───────────────────────────────────────────────

type AuthenticatedHandler = (
  req: NextRequest,
  ctx: { userId: string; userRole: UserRole; email: string },
) => Promise<NextResponse> | NextResponse

export function withAuth(handler: AuthenticatedHandler) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    return handler(req, {
      userId: session.user.id,
      userRole: session.user.role,
      email: session.user.email,
    })
  }
}

// ─── Role Required ───────────────────────────────────────────────

export function withRole(...roles: UserRole[]) {
  return function (handler: AuthenticatedHandler) {
    return withAuth(async function (req, ctx) {
      if (!roles.includes(ctx.userRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      return handler(req, ctx)
    })
  }
}

// ─── Admin Required ──────────────────────────────────────────────

export function withAdmin(handler: AuthenticatedHandler) {
  return withRole('ADMIN', 'SUPERADMIN')(handler)
}

// ─── Compose Helpers ─────────────────────────────────────────────

type MiddlewareFn = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) => (req: NextRequest) => Promise<NextResponse> | NextResponse

export function compose(...middlewares: MiddlewareFn[]): MiddlewareFn {
  return function (handler) {
    return middlewares.reduceRight((acc, mw) => mw(acc), handler)
  }
}

// ─── Preset Combinations ─────────────────────────────────────────

export const publicEndpoint = compose(withRateLimit('GENERAL'))

export const authEndpoint = compose(withRateLimit('AUTH'), withCsrfProtection, withAuth)

export const adminEndpoint = compose(withRateLimit('AUTH'), withCsrfProtection, withAdmin)

export const loginEndpoint = compose(withRateLimit('LOGIN'), withCsrfProtection)

export const registerEndpoint = compose(withRateLimit('REGISTER'), withCsrfProtection)
