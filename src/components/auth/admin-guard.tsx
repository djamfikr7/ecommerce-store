'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AdminGuard({ children, fallback, redirectTo = '/' }: AdminGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?callbackUrl=/admin')
      return
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
      router.push(redirectTo)
      return
    }
  }, [session, status, router, redirectTo])

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

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
    return null
  }

  return <>{children}</>
}
