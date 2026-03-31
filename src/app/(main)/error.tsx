'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ErrorState
        title="Something went wrong"
        message={error.message || 'An unexpected error occurred. Please try again.'}
        error={process.env.NODE_ENV === 'development' ? error : undefined}
        showDetails={process.env.NODE_ENV === 'development'}
        onRetry={reset}
        onGoHome={() => (window.location.href = '/')}
      />
    </div>
  )
}
