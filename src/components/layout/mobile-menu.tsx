'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  User,
  Heart,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  Tag,
  TrendingUp,
  Sparkles,
  Package,
} from 'lucide-react'

interface MobileMenuProps {
  onLinkClick: () => void
}

const categories = [
  {
    name: 'Electronics',
    icon: Package,
    subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio'],
  },
  {
    name: 'Fashion',
    icon: Tag,
    subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'],
  },
  {
    name: 'Home & Living',
    icon: Sparkles,
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Storage'],
  },
  {
    name: 'Sports',
    icon: TrendingUp,
    subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Cycling', 'Yoga'],
  },
]

const userMenuItems = [
  { href: '/account', label: 'My Account', icon: User },
  { href: '/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/addresses', label: 'Addresses', icon: MapPin },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileMenu({ onLinkClick }: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false)

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  return (
    <div className="space-y-2">
      {/* User Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsUserMenuExpanded(!isUserMenuExpanded)}
          className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-200">Guest User</p>
              <p className="text-xs text-gray-400">Sign in for more features</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isUserMenuExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isUserMenuExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1 px-2">
                {userMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onLinkClick}
                      className="group flex items-center gap-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 transition-all duration-200 hover:from-gray-700/50 hover:to-gray-800/50"
                    >
                      <Icon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-400" />
                      <span className="text-sm text-gray-300 transition-colors group-hover:text-gray-200">
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
                <button
                  onClick={onLinkClick}
                  className="group flex w-full items-center gap-3 rounded-xl bg-gradient-to-br from-red-900/20 to-red-800/20 p-3 transition-all duration-200 hover:from-red-900/30 hover:to-red-800/30"
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-red-400">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Links */}
      <div className="mb-6 space-y-2">
        <Link
          href="/deals"
          onClick={onLinkClick}
          className="flex items-center justify-between rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 p-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-orange-300">Hot Deals</span>
          </div>
          <ChevronRight className="h-5 w-5 text-orange-400" />
        </Link>

        <Link
          href="/new-arrivals"
          onClick={onLinkClick}
          className="flex items-center justify-between rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-300">New Arrivals</span>
          </div>
          <ChevronRight className="h-5 w-5 text-blue-400" />
        </Link>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Categories
        </h3>
        {categories.map((category) => {
          const Icon = category.icon
          const isExpanded = expandedCategory === category.name

          return (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all duration-200 active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-800">
                    <Icon className="h-5 w-5 text-gray-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{category.name}</span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1 px-2">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory}
                          href={`/category/${category.name.toLowerCase()}/${subcategory.toLowerCase()}`}
                          onClick={onLinkClick}
                          className="group flex items-center gap-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 pl-14 transition-all duration-200 hover:from-gray-700/50 hover:to-gray-800/50"
                        >
                          <span className="text-sm text-gray-400 transition-colors group-hover:text-gray-200">
                            {subcategory}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
