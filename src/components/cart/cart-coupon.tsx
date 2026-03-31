'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, X, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartCouponProps {
  onApply: (code: string) => Promise<void>
  onRemove?: (() => void) | undefined
  appliedCode?: string | undefined
  isLoading?: boolean
}

export function CartCoupon({ onApply, onRemove, appliedCode, isLoading = false }: CartCouponProps) {
  const [code, setCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setIsApplying(true)
    setError(null)

    try {
      await onApply(code.trim())
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon')
    } finally {
      setIsApplying(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  const handleRemove = async () => {
    if (onRemove) {
      await onRemove()
    }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="coupon-code" className="flex items-center gap-2 text-sm text-white/50">
        <Tag className="h-4 w-4" />
        Coupon Code
      </label>

      <AnimatePresence mode="wait">
        {appliedCode ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-3"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-4 w-4 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-green-400">{appliedCode}</p>
              <p className="text-xs text-green-400/70">Coupon applied successfully</p>
            </div>
            {onRemove && (
              <button
                onClick={handleRemove}
                disabled={isLoading}
                className="rounded-lg p-1.5 text-green-400/70 transition-colors hover:bg-green-500/20 hover:text-green-400 disabled:opacity-50"
                aria-label="Remove coupon"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="coupon-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setError(null)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter code"
                  disabled={isApplying || isLoading}
                  className={cn(
                    'w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30',
                    'transition-all focus:border-accent-primary focus:outline-none',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error ? 'border-red-500/50' : 'border-white/10',
                  )}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                disabled={isApplying || isLoading || !code.trim()}
                className={cn(
                  'rounded-xl px-5 py-3 font-medium transition-all',
                  'bg-accent-primary text-white',
                  'hover:bg-accent-primary-hover',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'flex items-center justify-center gap-2',
                )}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="sr-only">Applying...</span>
                  </>
                ) : (
                  'Apply'
                )}
              </motion.button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-1 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CartCoupon
