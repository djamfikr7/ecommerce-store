'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeft,
  Search,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
} from 'lucide-react'

const quickLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl text-center"
      >
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="relative mb-6"
          >
            <div className="neo-pressed-sm inline-flex items-center gap-3 rounded-full bg-cyan-500/10 px-5 py-2">
              <Search className="h-5 w-5 text-cyan-400" aria-hidden="true" />
              <span className="text-sm font-medium text-cyan-300">Page not found</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-7xl font-black text-transparent sm:text-8xl">
              404
            </h1>
            <h2 className="mb-3 text-xl font-semibold text-white">
              This page doesn&apos;t exist in the admin panel
            </h2>
            <p className="mb-8 text-slate-400">
              The route you&apos;re looking for isn&apos;t available. Check the quick links below.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickLinks.map((link, i) => {
                const Icon = link.icon
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 text-sm text-slate-400 transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-800/60 hover:text-cyan-300"
                    >
                      <Icon
                        className="h-6 w-6 transition-transform duration-200 group-hover:scale-110"
                        aria-hidden="true"
                      />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <Link href="/admin/dashboard">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 1, scale: 0.98 }}
                className="neo-raised-sm hover:neo-glow inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition-shadow duration-300"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Back to Dashboard
              </motion.div>
            </Link>
            <div className="mt-4">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Go back
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
