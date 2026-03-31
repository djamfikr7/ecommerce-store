'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminBreadcrumbs } from '@/components/admin/admin-breadcrumbs'

const mobileNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-xl bg-slate-800/50 p-2 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-slate-700/50 hover:text-white"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-lg font-bold text-transparent">
            VoltStore
          </span>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-slate-900/98 fixed bottom-0 left-0 top-0 z-50 w-[280px] shadow-[4px_0_24px_rgba(0,0,0,0.4)] backdrop-blur-md lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-700/50 p-4">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                  VoltStore
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-slate-800/50 p-2 text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1.5 p-4">
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-purple-500" />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <motion.div
        animate={{
          marginLeft: sidebarCollapsed ? 80 : 256,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="min-h-screen"
      >
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <AdminHeader />
        </div>

        {/* Page Content */}
        <main className="p-4 pt-20 lg:p-8 lg:pt-6">
          <AdminBreadcrumbs />
          {children}
        </main>
      </motion.div>
    </div>
  )
}
