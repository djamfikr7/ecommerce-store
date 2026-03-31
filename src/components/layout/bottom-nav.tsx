'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, User } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/account', label: 'Account', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="border-t border-gray-700/50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="safe-area-inset-bottom flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex min-w-0 flex-1 flex-col items-center justify-center"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-[inset_0_2px_8px_rgba(59,130,246,0.3)]'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]'
                  } `}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? 'text-blue-400' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
