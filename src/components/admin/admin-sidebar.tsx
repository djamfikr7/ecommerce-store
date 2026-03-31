'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

const sidebarVariants = {
  expanded: { width: 256 },
  collapsed: { width: 80 },
}

const navItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  }),
}

const tooltipVariants = {
  hidden: { opacity: 0, x: 8, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, x: 8, scale: 0.95, transition: { duration: 0.1 } },
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-slate-900/98 fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-700/50 backdrop-blur-md"
    >
      {/* Logo */}
      <div className="flex min-h-[73px] items-center justify-between border-b border-slate-700/50 px-4 py-4">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="logo-collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative mx-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                V
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-lg font-bold text-transparent">
                  V
                </span>
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-lg font-bold text-transparent">
                VoltStore
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <motion.div
              key={item.href}
              custom={index}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              className="relative"
              onMouseEnter={() => collapsed && setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                className={`group relative flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.2)]'
                    : 'text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:bg-slate-800/60 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.2)]'
                } ${collapsed ? 'justify-center' : 'gap-3'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-purple-500"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-transform duration-200 ${
                    isActive
                      ? 'drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      : 'group-hover:scale-110'
                  }`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                  />
                )}
              </Link>

              {/* Tooltip for collapsed state */}
              <AnimatePresence>
                {collapsed && hoveredItem === item.href && (
                  <motion.div
                    variants={tooltipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-1.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                  >
                    {item.label}
                    <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-slate-700/50 bg-slate-800" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-700/50 p-3">
        <button
          onClick={onToggle}
          className={`flex w-full items-center justify-center rounded-xl bg-slate-800/40 p-2.5 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-slate-700/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_8px_rgba(0,0,0,0.3)] ${
            collapsed ? '' : 'gap-2 px-4'
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap text-xs font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
