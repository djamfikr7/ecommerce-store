'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            `
            flex h-11 w-full rounded-lg
            neo-inset
            bg-surface-base
            px-4 py-2
            text-base text-slate-100
            placeholder:text-slate-500
            transition-all duration-200
            focus:outline-none
            focus:ring-2 focus:ring-accent-primary/50
            focus:border-accent-primary
            disabled:cursor-not-allowed disabled:opacity-50
            `,
            error && 'border-accent-danger focus:ring-accent-danger/50',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            {rightIcon}
          </div>
        )}
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-accent-danger"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
