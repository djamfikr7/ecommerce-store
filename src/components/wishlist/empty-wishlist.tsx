'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyWishlist() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.03] p-12 text-center backdrop-blur-sm"
    >
      {/* Animated Illustration */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: [0, -12, 0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-8"
      >
        <div className="relative flex h-40 w-40 items-center justify-center">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="border-accent-danger/20 absolute inset-0 rounded-full border-2 border-dashed"
          />

          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3 rounded-full border border-dashed border-purple-500/15"
          />

          {/* Inner circle with gradient */}
          <div className="from-accent-danger/20 absolute inset-6 rounded-full bg-gradient-to-br via-purple-500/10 to-pink-500/10 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.4),inset_-2px_-2px_8px_rgba(255,255,255,0.03)]" />

          {/* Heart icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="text-accent-danger/60 fill-accent-danger/20 relative h-16 w-16" />
          </motion.div>

          {/* Sparkle decorations */}
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
            className="absolute -top-1 right-8"
          >
            <Sparkles className="h-5 w-5 text-yellow-400/50" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -left-2 bottom-4"
          >
            <Sparkles className="h-4 w-4 text-purple-400/50" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -right-3 top-8"
          >
            <Sparkles className="h-3 w-3 text-pink-400/50" />
          </motion.div>
        </div>
      </motion.div>

      {/* Text Content */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-3 text-3xl font-bold text-white"
      >
        Your wishlist is empty
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 max-w-md text-white/50"
      >
        Save items you love by clicking the heart icon on any product. They will appear here for
        easy access later.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-4 sm:flex-row"
      >
        <Link href="/shop">
          <Button size="lg" className="gap-2">
            <ShoppingBag className="h-5 w-5" />
            Browse Products
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2">
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>

      {/* Additional Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex items-center gap-4 text-sm"
      >
        <span className="text-white/30">or explore</span>
        <Link
          href="/shop"
          className="font-medium text-accent-primary transition-colors hover:text-accent-primary-hover"
        >
          Featured Collections
        </Link>
      </motion.div>
    </motion.div>
  )
}
