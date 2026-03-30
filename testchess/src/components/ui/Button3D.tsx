'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Button3DProps {
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  disabled?: boolean
}

export default function Button3D({
  onClick,
  children,
  variant = 'primary',
  className = '',
  disabled = false,
}: Button3DProps) {
  const baseStyles =
    'relative px-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-200'

  const variantStyles = {
    primary:
      'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-neomorphic hover:shadow-[10px_10px_20px_#0a0a0f,-10px_-10px_20px_#1a1a2e] hover:shadow-blue-500/20',
    secondary:
      'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-200 shadow-neomorphic hover:shadow-[6px_6px_12px_#0a0a0f,-6px_-6px_12px_#1a1a2e]',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.02,
              y: -2,
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
            }
      }
      whileTap={disabled ? {} : { scale: 0.98, y: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  )
}
