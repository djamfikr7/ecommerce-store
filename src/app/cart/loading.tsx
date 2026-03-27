'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Header Skeleton */}
      <header className="border-b border-white/10 bg-[#0f0f23]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
            <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Items Count */}
            <div className="h-8 w-32 bg-white/5 rounded animate-pulse mb-6" />

            {/* Cart Items */}
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-white/5"
              >
                {/* Image */}
                <div className="w-full sm:w-32 h-32 rounded-xl bg-white/5 animate-pulse" />

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-1/4 bg-white/5 rounded animate-pulse" />

                  {/* Mobile Controls */}
                  <div className="flex items-center justify-between mt-4 sm:hidden">
                    <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-10 w-10 bg-white/5 rounded-xl animate-pulse" />
                  </div>
                </div>

                {/* Desktop Controls */}
                <div className="hidden sm:flex items-start gap-6">
                  <div className="h-12 w-20 bg-white/5 rounded-xl animate-pulse" />
                  <div className="h-8 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-12 w-12 bg-white/5 rounded-xl animate-pulse" />
                </div>
              </motion.div>
            ))}

            {/* Benefits Skeleton */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="hidden lg:block space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-white/5 p-6 space-y-4"
            >
              {/* Title */}
              <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />

              {/* Subtotal */}
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />

              {/* Total */}
              <div className="pt-4 border-t border-white/10">
                <div className="h-8 w-1/2 bg-white/5 rounded ml-auto animate-pulse" />
              </div>

              {/* Promo Code */}
              <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />

              {/* Button */}
              <div className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
