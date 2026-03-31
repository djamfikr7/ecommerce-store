'use client'

import { motion } from 'framer-motion'
import { Package, Search, Plus } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?:
    | {
        label: string
        onClick: () => void
        icon?: React.ReactNode
      }
    | undefined
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const defaultIcon = <Package className="h-16 w-16 text-gray-600" aria-hidden="true" />

  return (
    <div className={cn('flex min-h-[400px] items-center justify-center p-6', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
          className="mb-6 flex justify-center"
        >
          <div className="rounded-full bg-gray-800/50 p-6 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]">
            {icon || defaultIcon}
          </div>
        </motion.div>

        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>

        {description && <p className="mb-6 text-gray-400">{description}</p>}

        {action && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button onClick={action.onClick} variant="default" size="lg" className="shadow-lg">
              {action.icon}
              {action.label}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

// Preset empty states
export function NoResultsState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-16 w-16 text-gray-600" aria-hidden="true" />}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      action={
        onClear
          ? {
              label: 'Clear filters',
              onClick: onClear,
            }
          : undefined
      }
    />
  )
}

export function NoProductsState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-16 w-16 text-gray-600" aria-hidden="true" />}
      title="No products yet"
      description="Get started by adding your first product to the store."
      action={
        onCreate
          ? {
              label: 'Add product',
              onClick: onCreate,
              icon: <Plus className="h-4 w-4" aria-hidden="true" />,
            }
          : undefined
      }
    />
  )
}
