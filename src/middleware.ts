/**
 * Next.js Middleware for Authentication and Localization
 * Protects routes that require authentication
 * Handles locale detection and redirection
 */

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing, locales, defaultLocale } from '@/lib/i18n/routing'

// Routes that require authentication
const protectedRoutes = [
  '/admin',
  '/checkout',
  '/orders',
  '/account',
  '/profile',
  '/wishlist',
  '/settings',
]

// Routes only for unauthenticated users (redirect if logged in)
const authRoutes = [
  '/login',
  '/register',
]

// Admin-only routes
const adminRoutes = ['/admin']
const adminApiRoutes = ['/api/admin']

// Public paths that should not be locale-prefixed
const publicPaths = ['/api', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml']

function getLocaleFromRequest(request: NextRequest): string {
  // Priority 1: Check cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])) {
    return cookieLocale
  }

  // Priority 2: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language')
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [code, q] = lang.trim().split(';q=')
        return { code: code.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 }
      })
      .sort((a, b) => b.q - a.q)

    for (const { code } of languages) {
      if (locales.includes(code as (typeof locales)[number])) {
        return code
      }
    }
  }

  // Default to default locale
  return defaultLocale
}

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((path) => pathname.startsWith(path))
}

function pathnameHasLocale(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return false
  const firstSegment = segments[0]
  return locales.includes(firstSegment as (typeof locales)[number])
}

export default auth((req: NextRequest & { auth: { user?: { role: string } } | null }) => {
  const { pathname } = req.nextUrl

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale
  const pathnameHasLocaleFlag = pathnameHasLocale(pathname)

  // Get the user's preferred locale
  const locale = getLocaleFromRequest(req)

  // If pathname doesn't have a locale, redirect to locale-prefixed version
  if (!pathnameHasLocaleFlag && pathname !== '/') {
    const newUrl = new URL(`/${locale}${pathname}`, req.url)
    newUrl.search = req.nextUrl.search
    return NextResponse.redirect(newUrl)
  }

  // Auth-related checks (only if authenticated)
  const { pathname: authPathname } = req.nextUrl
  const isLoggedIn = !!req.auth?.user
  const userRole = req.auth?.user?.role

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    authPathname.startsWith(route)
  )

  // Check if route is for guests only
  const isAuthRoute = authRoutes.some((route) => authPathname.startsWith(route))

  // Check if route is admin-only
  const isAdminRoute = adminRoutes.some((route) => authPathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
    const redirectUrl = callbackUrl
      ? new URL(callbackUrl, req.url)
      : new URL('/', req.url)

    return NextResponse.redirect(redirectUrl)
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', authPathname)

    return NextResponse.redirect(loginUrl)
  }

  // Redirect non-admin users from admin routes
  if (isAdminRoute && userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
    const unauthorizedUrl = new URL('/', req.url)
    return NextResponse.redirect(unauthorizedUrl)
  }

  // Create response with locale header
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  return response
})

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
