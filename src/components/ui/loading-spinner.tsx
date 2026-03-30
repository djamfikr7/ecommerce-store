'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type SpinnerVariant = 'default' | 'dots' | 'pulse' | 'ring'
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface LoadingSpinnerProps {
  variant?: SpinnerVariant
  size?: SpinnerSize
  className?: string
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const dotSizes: Record<SpinnerSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
  xl: 'w-5 h-5',
}

export function LoadingSpinner({
  variant = 'default',
  size = 'md',
  className,
  label = 'Loading',
}: LoadingSpinnerProps) {
  if (variant === 'dots') {
    return (
      <div
        className={cn('flex items-center justify-center gap-2', className)}
        role="status"
        aria-label={label}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-gradient-to-br from-purple-500 to-pink-500',
              dotSizes[size],
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        role="status"
        aria-label={label}
      >
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-br from-purple-500 to-pink-500',
            sizeClasses[size],
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  if (variant === 'ring') {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        role="status"
        aria-label={label}
      >
        <motion.div
          className={cn('rounded-full border-4 border-gray-800', sizeClasses[size])}
          style={{
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20" />
        </motion.div>
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  // Default spinner
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label={label}
    >
      <motion.div
        className={cn('relative', sizeClasses[size])}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-gray-800/50" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: '#a855f7',
            borderRightColor: '#ec4899',
          }}
        />
      </motion.div>
      <span className="sr-only">{label}</span>
    </div>
  )
}
