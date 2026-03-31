'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CreditCard, Truck, Store, ChevronRight } from 'lucide-react'

const settingsSections = [
  {
    href: '/admin/settings/general',
    label: 'General',
    description: 'Store name, logo, contact info, and branding',
    icon: Store,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    href: '/admin/settings/payments',
    label: 'Payments',
    description: 'Stripe API keys, test/live mode, payment methods',
    icon: CreditCard,
    color: 'from-purple-500 to-pink-500',
  },
  {
    href: '/admin/settings/shipping',
    label: 'Shipping',
    description: 'Shipping zones, rates, and free shipping thresholds',
    icon: Truck,
    color: 'from-emerald-500 to-teal-500',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white lg:text-3xl">Settings</h1>
        <p className="mt-1 text-slate-400">Manage your store configuration and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {settingsSections.map((section, i) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={section.href}
                className="group block rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl bg-gradient-to-br p-3 ${section.color} shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-slate-500 transition-colors group-hover:text-slate-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{section.label}</h3>
                <p className="mt-1 text-sm text-slate-400">{section.description}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Info */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Info</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-500">Environment</p>
            <p className="text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                Development
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-500">Database</p>
            <p className="text-sm text-slate-300">SQLite (local)</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-500">Version</p>
            <p className="text-sm text-slate-300">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
