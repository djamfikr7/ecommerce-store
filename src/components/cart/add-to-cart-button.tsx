'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useCart } from './cart-context'

interface AddToCartButtonProps {
  productId: string
  variantId?: string
  quantity?: number
  price: number
  name: string
  slug: string
  image?: string
  variantName?: string
  sku?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  onSuccess?: () => void
}

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  price,
  name,
  slug,
  image,
  variantName,
  sku,
  disabled = false,
  className = '',
  size = 'md',
  fullWidth = false,
  onSuccess,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleAddToCart = async () => {
    if (isAdding || disabled) return

    setIsAdding(true)
    try {
      await addItem({
        productId,
        ...(variantId && { variantId }),
        quantity,
        price,
        name,
        slug,
        ...(image && { image }),
        ...(variantName && { variantName }),
        ...(sku && { sku }),
      })

      setShowSuccess(true)
      onSuccess?.()

      // Reset success state after animation
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <motion.button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`relative overflow-hidden ${fullWidth ? 'w-full' : 'inline-flex'} ${sizeClasses[size]} flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 font-bold text-white shadow-[8px_8px_16px_#0a0a0a,-8px_-8px_16px_#2a2a2a] transition-all duration-300 hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4)] disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
    >
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={showSuccess ? { x: '100%' } : {}}
        transition={{ duration: 0.6 }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {isAdding ? (
          <>
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
            Adding...
          </>
        ) : showSuccess ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Check className={iconSizes[size]} />
            </motion.div>
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className={iconSizes[size]} />
            Add to Cart
          </>
        )}
      </span>

      {/* Success Ripple Effect */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-green-500/30"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}

export default AddToCartButton
