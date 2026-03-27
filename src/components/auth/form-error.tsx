'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  message: string | null | undefined
  className?: string
  onDismiss?: () => void
}

export function FormError({ message, className, onDismiss }: FormErrorProps) {
  if (!message) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, x: -10 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            type: 'spring',
            stiffness: 500,
            damping: 25,
          },
        }}
        exit={{ opacity: 0, x: -10 }}
        className={cn(
          `
          neo-inset
          flex items-center gap-2
          px-4 py-3
          rounded-lg
          bg-accent-danger/10
          border border-accent-danger/30
          text-accent-danger text-sm
          `,
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 hover:bg-accent-danger/20 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
