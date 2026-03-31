'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, User, X } from 'lucide-react'
import { MobileMenu } from './mobile-menu'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 top-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-gray-700/50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={onClose}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent"
                  >
                    ShopHub
                  </motion.div>
                </Link>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7)]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Menu Content */}
            <div className="px-4 py-6">
              <MobileMenu onLinkClick={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
