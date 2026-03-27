'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Sidebar({ open, onClose, title, children }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: open ? 0 : '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-80 max-w-[85vw] neo-card z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Sidebar'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          {title && <h2 className="font-semibold">{title}</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </motion.aside>
    </>
  )
}

interface CategorySidebarProps {
  open: boolean
  onClose: () => void
  categories: Array<{ slug: string; name: string; count?: number }>
  activeCategory?: string
}

export function CategorySidebar({
  open,
  onClose,
  categories,
  activeCategory,
}: CategorySidebarProps) {
  return (
    <Sidebar open={open} onClose={onClose} title="Categories">
      <nav className="space-y-1">
        <Link
          href="/products"
          className={`
            block px-3 py-2 rounded-lg transition-colors
            ${!activeCategory ? 'bg-accent-primary/20 text-accent-primary' : 'text-slate-300 hover:bg-surface-elevated'}
          `}
          onClick={onClose}
        >
          All Products
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className={`
              flex items-center justify-between px-3 py-2 rounded-lg transition-colors
              ${activeCategory === category.slug ? 'bg-accent-primary/20 text-accent-primary' : 'text-slate-300 hover:bg-surface-elevated'}
            `}
            onClick={onClose}
          >
            <span>{category.name}</span>
            {category.count !== undefined && (
              <span className="text-sm text-slate-500">{category.count}</span>
            )}
          </Link>
        ))}
      </nav>
    </Sidebar>
  )
}
