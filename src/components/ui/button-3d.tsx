'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const button3dVariants = cva(
  `
    relative inline-flex items-center justify-center gap-2
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
    disabled:pointer-events-none disabled:opacity-50
    select-none cursor-pointer
    [transform-style:preserve-3d]
    [perspective:800px]
  `,
  {
    variants: {
      variant: {
        default: `
          bg-gradient-to-br from-accent-primary to-accent-secondary text-white
          shadow-[0_6px_0_theme(colors.indigo.900),0_8px_20px_rgba(0,0,0,0.4)]
          hover:shadow-[0_8px_0_theme(colors.indigo.900),0_12px_28px_rgba(0,0,0,0.5)]
          active:shadow-[0_2px_0_theme(colors.indigo.900),0_4px_12px_rgba(0,0,0,0.3)]
        `,
        destructive: `
          bg-gradient-to-br from-accent-danger to-red-700 text-white
          shadow-[0_6px_0_theme(colors.red.950),0_8px_20px_rgba(0,0,0,0.4)]
          hover:shadow-[0_8px_0_theme(colors.red.950),0_12px_28px_rgba(0,0,0,0.5)]
          active:shadow-[0_2px_0_theme(colors.red.950),0_4px_12px_rgba(0,0,0,0.3)]
        `,
        neomorphic: `
          bg-gradient-to-br from-surface-elevated to-surface-base text-slate-100
          shadow-[6px_6px_12px_var(--neo-shadow-dark),-6px_-6px_12px_var(--neo-shadow-light),0_4px_0_rgba(0,0,0,0.3)]
          hover:shadow-[8px_8px_16px_var(--neo-shadow-dark),-8px_-8px_16px_var(--neo-shadow-light),0_6px_0_rgba(0,0,0,0.4)]
          active:shadow-[inset_2px_2px_4px_var(--neo-shadow-inset-dark),inset_-2px_-2px_4px_var(--neo-shadow-inset-light),0_1px_0_rgba(0,0,0,0.2)]
          border border-border-default
        `,
        success: `
          bg-gradient-to-br from-accent-success to-emerald-700 text-white
          shadow-[0_6px_0_theme(colors.emerald.950),0_8px_20px_rgba(0,0,0,0.4)]
          hover:shadow-[0_8px_0_theme(colors.emerald.950),0_12px_28px_rgba(0,0,0,0.5)]
          active:shadow-[0_2px_0_theme(colors.emerald.950),0_4px_12px_rgba(0,0,0,0.3)]
        `,
        glass: `
          bg-white/5 backdrop-blur-md text-white
          border border-white/10
          shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
          hover:bg-white/10 hover:border-white/20
          hover:shadow-[0_8px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
          active:bg-white/5
          active:shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]
        `,
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-lg',
        md: 'h-11 px-5 text-base',
        lg: 'h-14 px-7 text-lg',
        xl: 'h-16 px-9 text-xl',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface Button3DProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button3dVariants> {
  loading?: boolean
}

const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -3 }}
        whileTap={{ y: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={cn(button3dVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...(props as Record<string, unknown>)}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  },
)

Button3D.displayName = 'Button3D'

export { Button3D, button3dVariants }
