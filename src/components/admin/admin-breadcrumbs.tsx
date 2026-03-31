'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  users: 'Users',
  analytics: 'Analytics',
  settings: 'Settings',
  new: 'Create New',
  edit: 'Edit',
}

function formatSegment(segment: string): string {
  if (routeLabels[segment]) return routeLabels[segment]
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    const label = formatSegment(segment)

    return { href, label, isLast }
  })

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Breadcrumb"
      className="mb-6 flex items-center gap-1.5 text-sm"
    >
      <Link
        href="/admin/dashboard"
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-cyan-400"
      >
        <Home size={14} />
      </Link>

      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-slate-600" />
          {crumb.isLast ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-cyan-400"
            >
              {crumb.label}
            </motion.span>
          ) : (
            <Link href={crumb.href} className="text-slate-400 transition-colors hover:text-white">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </motion.nav>
  )
}
