'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight } from 'lucide-react'

interface EmptyCartProps {
  title?: string
  description?: string
  showContinueShopping?: boolean
}

export function EmptyCart({
  title = 'Your cart is empty',
  description = "Looks like you haven't added anything to your cart yet.",
  showContinueShopping = true,
}: EmptyCartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center px-4 py-16"
    >
      {/* Illustration */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: [0, -15, 0, -10, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative mb-8"
      >
        <div className="neo-raised-lg from-accent-primary/20 to-accent-secondary/20 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br">
          <svg
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-white/30"
          >
            <path
              d="M20 16H60L56 52H24L20 16Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 16L24 8C24 8 28 4 40 4C52 4 56 8 56 8L60 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="48" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="border-accent-primary/30 absolute -right-2 -top-2 h-8 w-8 rounded-full border-2 border-dashed"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="bg-accent-secondary/20 absolute -bottom-1 -left-3 h-6 w-6 rounded-full"
        />
      </motion.div>

      {/* Text Content */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-3 text-center text-2xl font-bold text-white"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 max-w-md text-center text-white/50"
      >
        {description}
      </motion.p>

      {/* CTA Button */}
      {showContinueShopping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/products"
            className="neo-raised hover:neo-glow inline-flex items-center gap-2 rounded-xl bg-accent-primary px-8 py-4 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-primary-hover"
          >
            Start Shopping
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      )}

      {/* Additional Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex items-center gap-4"
      >
        <span className="text-sm text-white/30">or</span>
        <Link
          href="/categories"
          className="text-sm font-medium text-accent-primary transition-colors hover:text-accent-primary-hover"
        >
          Browse Categories
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default EmptyCart
