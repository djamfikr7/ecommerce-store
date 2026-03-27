'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto px-4 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-orange-500/20 mx-auto mb-6 flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-orange-400" />
        </motion.div>

        {/* Message */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Checkout Cancelled
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/60 mb-8"
        >
          Your checkout was cancelled. No worries - your cart items are still saved and ready when you are.
        </motion.p>

        {/* Cart Items Preserved Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-white/5 mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-white/50">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm">Your cart items are safe</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
          >
            Return to Cart
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-white/40 mt-8"
        >
          Having trouble?{' '}
          <Link href="/contact" className="text-accent hover:underline">
            Contact Support
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
