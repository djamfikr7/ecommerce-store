'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, ShoppingCart, Bell, X } from 'lucide-react'

interface MobileHeaderProps {
  onMenuToggle: () => void
  isMenuOpen: boolean
}

export function MobileHeader({ onMenuToggle, isMenuOpen }: MobileHeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  // Mock cart count - replace with actual cart hook when available
  const cartItemCount = 0

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 lg:hidden">
        <div className="border-b border-gray-700/50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="flex h-16 items-center justify-between px-4">
            {/* Left: Menu Button */}
            <button
              onClick={onMenuToggle}
              className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7)]"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-full w-full items-center justify-center"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-300" />
                )}
              </motion.div>
            </button>

            {/* Center: Logo */}
            <Link href="/" className="flex-shrink-0">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent"
              >
                ShopHub
              </motion.div>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7)]"
                aria-label="Search"
              >
                <Search className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
              </button>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7)]"
                aria-label={`Cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-xs font-bold text-white shadow-lg"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="search"
                    placeholder="Search products..."
                    autoFocus
                    className="h-12 w-full rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 px-4 pl-11 text-gray-200 placeholder-gray-500 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] transition-colors focus:border-blue-500/50 focus:outline-none"
                  />
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7)]"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5 text-gray-300" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
