'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error | undefined
  onRetry?: () => void
  onGoHome?: () => void
  className?: string
  showDetails?: boolean
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  onGoHome,
  className,
  showDetails = false,
}: ErrorStateProps) {
  return (
    <div className={cn('flex min-h-[400px] items-center justify-center p-6', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-gray-900/50 p-8 text-center shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.02)]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="rounded-full bg-red-500/10 p-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]">
              <AlertCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
            </div>
          </motion.div>

          <h2 className="mb-3 text-2xl font-bold text-white">{title}</h2>
          <p className="mb-6 text-gray-400">{message}</p>

          {showDetails && error && (
            <details className="mb-6 rounded-lg bg-gray-800/50 p-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-300">
                Technical details
              </summary>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-red-400">{error.message}</p>
                {error.stack && (
                  <pre className="overflow-auto text-xs text-gray-500">{error.stack}</pre>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            {onRetry && (
              <Button onClick={onRetry} variant="default" className="flex-1" aria-label="Retry">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            )}
            {onGoHome && (
              <Button
                onClick={onGoHome}
                variant="secondary"
                className="flex-1"
                aria-label="Go to home page"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Go home
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
