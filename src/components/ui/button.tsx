'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import styles from './button.module.css'

const buttonVariants = cva(
  // Base styles
  `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
    disabled:pointer-events-none disabled:opacity-50
    select-none
  `,
  {
    variants: {
      variant: {
        default: `
          bg-accent-primary text-white
          neo-raised-sm
          hover:bg-accent-primary-hover hover:neo-glow
          active:neo-pressed-sm
        `,
        destructive: `
          bg-accent-danger text-white
          neo-raised-sm
          hover:brightness-110 hover:neo-glow
          active:neo-pressed-sm
        `,
        outline: `
          bg-transparent text-slate-100
          border border-border-default
          neo-flat
          hover:bg-surface-elevated hover:border-border-strong
          active:neo-pressed-sm
        `,
        secondary: `
          bg-surface-elevated text-slate-100
          neo-raised-sm
          hover:bg-surface-overlay
          active:neo-pressed-sm
        `,
        ghost: `
          bg-transparent text-slate-300
          hover:bg-surface-elevated hover:text-slate-100
          active:neo-pressed-sm
        `,
        link: `
          bg-transparent text-accent-primary
          underline-offset-4 hover:underline
          focus-visible:ring-0
        `,
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ y: 1, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
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
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
