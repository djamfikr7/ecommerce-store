'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface EmptyCartProps {
  title?: string;
  description?: string;
  showContinueShopping?: boolean;
}

export function EmptyCart({
  title = 'Your cart is empty',
  description = 'Looks like you haven\'t added anything to your cart yet.',
  showContinueShopping = true,
}: EmptyCartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-4"
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
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
          <svg
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-white/30"
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
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 border-dashed border-accent/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-purple-500/20"
        />
      </motion.div>

      {/* Text Content */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-3 text-center"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white/50 text-center max-w-md mb-8"
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
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
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
        <span className="text-white/30 text-sm">or</span>
        <Link
          href="/categories"
          className="text-accent hover:text-accent/80 text-sm font-medium transition-colors"
        >
          Browse Categories
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default EmptyCart;
