'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
  allowedRoles,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      const currentPath = window.location.pathname
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      router.push('/')
      return
    }
  }, [session, status, router, redirectTo, allowedRoles])

  if (status === 'loading') {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )
    )
  }

  if (!session) return null

  if (allowedRoles && !allowedRoles.includes(session.user.role)) return null

  return <>{children}</>
}
