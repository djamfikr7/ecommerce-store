'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWishlist } from './wishlist-context'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  variantId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTooltip?: boolean
  initialState?: boolean
}

export function WishlistButton({
  productId,
  variantId,
  size = 'md',
  className,
  showTooltip = true,
  initialState,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltipVisible, setShowTooltipVisible] = useState(false)

  const isWishlisted = initialState !== undefined ? initialState : isInWishlist(productId, variantId)

  const sizeClasses = {
    sm: {
      button: 'p-2',
      icon: 'w-4 h-4',
    },
    md: {
      button: 'p-3',
      icon: 'w-5 h-5',
    },
    lg: {
      button: 'p-4',
      icon: 'w-6 h-6',
    },
  }

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await toggleWishlist(productId, variantId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative inline-flex">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltipVisible(true)}
        onMouseLeave={() => setShowTooltipVisible(false)}
        disabled={isLoading}
        className={cn(
          'neo-raised-sm rounded-full transition-all duration-200',
          'hover:bg-surface-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
          isWishlisted && 'bg-accent-danger/20 hover:bg-accent-danger/30',
          isLoading && 'opacity-50 cursor-wait',
          sizeClasses[size].button,
          className
        )}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={isWishlisted}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="block"
          >
            <Heart className={cn(sizeClasses[size].icon, 'text-slate-400 animate-pulse')} />
          </motion.span>
        ) : (
          <motion.span
            initial={false}
            animate={{
              scale: isWishlisted ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={cn(
                sizeClasses[size].icon,
                'transition-colors',
                isWishlisted
                  ? 'fill-accent-danger text-accent-danger'
                  : 'text-slate-400 hover:text-accent-danger'
              )}
            />
          </motion.span>
        )}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{
            opacity: showTooltipVisible ? 1 : 0,
            y: showTooltipVisible ? 0 : 5,
          }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg',
            'bg-surface-overlay text-white text-sm whitespace-nowrap pointer-events-none',
            'neo-raised-sm z-10'
          )}
          role="tooltip"
        >
          {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-surface-overlay" />
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Compact version for use in cards
export function WishlistButtonCompact({
  productId,
  variantId,
  className,
}: Omit<WishlistButtonProps, 'size' | 'showTooltip'>) {
  return (
    <WishlistButton
      productId={productId}
      variantId={variantId}
      size="sm"
      showTooltip={false}
      className={cn('absolute top-2 right-2 z-10', className)}
    />
  )
}
