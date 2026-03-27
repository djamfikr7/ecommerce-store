import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30',
        secondary: 'bg-surface-elevated text-slate-300 border border-border-default',
        success: 'bg-accent-success/20 text-accent-success border border-accent-success/30',
        warning: 'bg-accent-warning/20 text-accent-warning border border-accent-warning/30',
        danger: 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30',
        info: 'bg-accent-info/20 text-accent-info border border-accent-info/30',
        outline: 'border border-border-default text-slate-400 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
